import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';

/**
 * Claude Service
 * Handles integration with Claude API for feature requests and custom field generation
 * Manages conversation history and generates implementation suggestions
 */

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Get system prompt with current context
 * @returns {Promise<string>} System prompt with context about existing custom fields
 */
async function getSystemPrompt() {
  try {
    const customFields = await db.customField.findMany({
      select: {
        name: true,
        label: true,
        type: true,
        entityType: true,
      },
    });

    const fieldsList = customFields.length
      ? customFields.map((f) => `- ${f.label} (${f.name}, type: ${f.type}, entity: ${f.entityType})`).join('\n')
      : 'No custom fields yet';

    return `You are an HR system assistant for V.Two Ops. You help users request features and create custom fields.

Current System State:
- Existing custom fields:
${fieldsList}
- Available field types: text, select, date, checkbox, number
- Entity types: candidate, employee, device

Your role:
1. Listen to user requests for new features or custom fields
2. Clarify what they need
3. Suggest implementation (e.g., "I'll create a custom field called 'certifications' with type 'select'")
4. Ask for confirmation before creating anything
5. Only create custom fields when explicitly asked by the user

When generating custom fields, provide:
- Field name (snake_case)
- Field label (human-readable)
- Field type (text, select, date, checkbox, number)
- Entity type (candidate, employee, or device)
- Options if it's a select field (as JSON array)

Keep responses concise and professional. Use bullet points for clarity.`;
  } catch (error) {
    console.error('Error building system prompt:', error);
    // Fallback prompt if there's an error
    return `You are an HR system assistant for V.Two Ops. You help users request features and create custom fields.

Available field types: text, select, date, checkbox, number
Entity types: candidate, employee, device

Your role:
1. Listen to user requests
2. Clarify what they need
3. Suggest implementation
4. Ask for confirmation before creating

Keep responses concise and professional.`;
  }
}

/**
 * Send a message to Claude and get a response
 * @param {string} userId - User ID (typically "admin" for Phase 2)
 * @param {string} content - User message content
 * @param {string} featureRequestId - Feature request ID (optional)
 * @returns {Promise<Object>} { message, featureRequest, actions }
 */
export async function sendMessage(userId, content, featureRequestId = null) {
  if (!userId) throw new Error('User ID is required');
  if (!content) throw new Error('Message content is required');

  // Get or create feature request
  let featureRequest;
  if (featureRequestId) {
    featureRequest = await db.featureRequest.findUnique({
      where: { id: featureRequestId },
      include: { messages: true },
    });

    if (!featureRequest) {
      throw new Error('Feature request not found');
    }
  } else {
    // Create new feature request
    featureRequest = await db.featureRequest.create({
      data: {
        title: content.substring(0, 100),
        description: content,
        status: 'requested',
        type: 'custom_field',
        originalMessage: content,
        claudeResponse: '', // Will be updated after Claude responds
      },
      include: { messages: true },
    });
  }

  // Save user message
  const userMessage = await db.chatMessage.create({
    data: {
      userId,
      role: 'user',
      content,
      relatedFeatureRequestId: featureRequest.id,
    },
  });

  // Get conversation history (last 10 messages for context)
  const conversationHistory = await db.chatMessage.findMany({
    where: {
      relatedFeatureRequestId: featureRequest.id,
    },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  // Build messages array for Claude (including the user message we just created)
  const messages = conversationHistory.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  // Call Claude API
  const systemPrompt = await getSystemPrompt();

  let claudeResponse;
  try {
    claudeResponse = await client.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages,
    });
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error(`Claude API error: ${error.message}`);
  }

  const assistantContent = claudeResponse.content[0].text;

  // Save assistant message
  const assistantMessage = await db.chatMessage.create({
    data: {
      userId,
      role: 'assistant',
      content: assistantContent,
      relatedFeatureRequestId: featureRequest.id,
    },
  });

  // Update feature request with Claude's response
  await db.featureRequest.update({
    where: { id: featureRequest.id },
    data: {
      claudeResponse: assistantContent,
    },
  });

  // Parse response for suggested actions
  const actions = parseResponse(assistantContent);

  return {
    message: assistantMessage,
    featureRequest,
    assistantResponse: assistantContent,
    actions,
  };
}

/**
 * Parse Claude's response to extract suggested actions
 * @param {string} response - Claude's response text
 * @returns {Object} { shouldCreateField, fieldSuggestion }
 */
function parseResponse(response) {
  const actions = {
    shouldCreateField: false,
    fieldSuggestion: null,
  };

  // Simple heuristic: if response mentions creating a field and includes field details
  if (
    response.toLowerCase().includes('create') &&
    (response.toLowerCase().includes('field') || response.toLowerCase().includes('custom'))
  ) {
    // Try to extract field details from the response
    const fieldNameMatch = response.match(/(?:field\s+(?:called|named|is)\s+)['"]?(\w+)['"]?/i);
    const typeMatch = response.match(/(?:type[:\s]+)(['"])?(\w+)['"]?/i);
    const entityMatch = response.match(/(?:entity[:\s]+|for\s+)(candidate|employee|device)/i);

    if (fieldNameMatch || typeMatch) {
      actions.shouldCreateField = true;
      actions.fieldSuggestion = {
        name: fieldNameMatch ? fieldNameMatch[1] : null,
        type: typeMatch ? typeMatch[2] : 'text',
        entityType: entityMatch ? entityMatch[1] : 'employee',
      };
    }
  }

  return actions;
}

/**
 * Get conversation history for a feature request
 * @param {string} featureRequestId - Feature request ID
 * @returns {Promise<Array>} Array of chat messages
 */
export async function getConversationHistory(featureRequestId) {
  if (!featureRequestId) throw new Error('Feature request ID is required');

  const messages = await db.chatMessage.findMany({
    where: {
      relatedFeatureRequestId: featureRequestId,
    },
    orderBy: { createdAt: 'asc' },
  });

  return messages;
}

/**
 * Create a custom field from Claude's suggestion
 * @param {string} featureRequestId - Feature request ID
 * @param {Object} fieldData - Field configuration
 * @param {string} fieldData.name - Field name (snake_case)
 * @param {string} fieldData.label - Field label (human-readable)
 * @param {string} fieldData.type - Field type (text, select, date, checkbox, number)
 * @param {string} fieldData.entityType - Entity type (candidate, employee, device)
 * @param {Array} fieldData.options - Options for select fields
 * @returns {Promise<Object>} Created custom field
 */
export async function createCustomFieldFromSuggestion(featureRequestId, fieldData) {
  if (!featureRequestId) throw new Error('Feature request ID is required');
  if (!fieldData.name) throw new Error('Field name is required');
  if (!fieldData.label) throw new Error('Field label is required');
  if (!fieldData.type) throw new Error('Field type is required');
  if (!fieldData.entityType) throw new Error('Entity type is required');

  // Validate field doesn't already exist
  const existingField = await db.customField.findUnique({
    where: {
      entityType_name: {
        entityType: fieldData.entityType,
        name: fieldData.name,
      },
    },
  });

  if (existingField) {
    throw new Error(`Custom field '${fieldData.name}' already exists for ${fieldData.entityType}`);
  }

  // Create custom field
  const customField = await db.customField.create({
    data: {
      name: fieldData.name,
      label: fieldData.label,
      type: fieldData.type,
      entityType: fieldData.entityType,
      options: fieldData.options ? JSON.stringify(fieldData.options) : null,
      required: fieldData.required || false,
      regex: fieldData.regex || null,
      active: true,
    },
  });

  // Update feature request status
  await db.featureRequest.update({
    where: { id: featureRequestId },
    data: {
      status: 'implementing',
      type: 'custom_field',
      implementation: JSON.stringify({
        type: 'create_custom_field',
        customFieldId: customField.id,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  return customField;
}

/**
 * List all feature requests
 * @param {Object} filters - Filter options
 * @param {string} filters.status - Filter by status
 * @param {number} filters.limit - Number of results (default 25)
 * @param {number} filters.offset - Number to skip (default 0)
 * @returns {Promise<Array>} Feature requests
 */
export async function listFeatureRequests(filters = {}) {
  const { status, limit = 25, offset = 0 } = filters;

  const where = {};
  if (status) {
    where.status = status;
  }

  const requests = await db.featureRequest.findMany({
    where,
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  return requests;
}

/**
 * Get feature request by ID
 * @param {string} id - Feature request ID
 * @returns {Promise<Object>} Feature request with messages
 */
export async function getFeatureRequest(id) {
  if (!id) throw new Error('Feature request ID is required');

  const request = await db.featureRequest.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!request) {
    throw new Error('Feature request not found');
  }

  return request;
}

/**
 * Update feature request status
 * @param {string} id - Feature request ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated feature request
 */
export async function updateFeatureRequestStatus(id, status) {
  if (!id) throw new Error('Feature request ID is required');
  if (!status) throw new Error('Status is required');

  const validStatuses = ['requested', 'reviewing', 'implementing', 'testing', 'deployed', 'rejected'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updated = await db.featureRequest.update({
    where: { id },
    data: {
      status,
      completedAt: status === 'deployed' ? new Date() : null,
    },
    include: {
      messages: true,
    },
  });

  return updated;
}
