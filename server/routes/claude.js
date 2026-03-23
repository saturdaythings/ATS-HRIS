import express from 'express';
import {
  sendMessage,
  getConversationHistory,
  createCustomFieldFromSuggestion,
  listFeatureRequests,
  getFeatureRequest,
  updateFeatureRequestStatus,
} from '../services/claudeService.js';

const router = express.Router();

/**
 * POST /api/claude/chat - Send a message and get Claude's response
 * Body: { content, featureRequestId? }
 * Returns: { message, featureRequest, assistantResponse, actions }
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { content, featureRequestId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Use "admin" as userId for Phase 2 (single-user system)
    const userId = 'admin';

    const result = await sendMessage(userId, content, featureRequestId);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/claude/conversations/:featureRequestId - Get chat history
 * Returns: Array of chat messages
 */
router.get('/conversations/:featureRequestId', async (req, res, next) => {
  try {
    const { featureRequestId } = req.params;

    const messages = await getConversationHistory(featureRequestId);

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/claude/feature-requests - List all feature requests
 * Query params:
 *   - status: Filter by status (requested, reviewing, implementing, testing, deployed, rejected)
 *   - limit: Number of results (default 25)
 *   - offset: Number to skip (default 0)
 */
router.get('/feature-requests', async (req, res, next) => {
  try {
    const { status, limit, offset } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit, 10);
    if (offset) filters.offset = parseInt(offset, 10);

    const requests = await listFeatureRequests(filters);

    res.json(requests);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/claude/feature-requests/:id - Get a specific feature request
 * Returns: Feature request with full message history
 */
router.get('/feature-requests/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const request = await getFeatureRequest(id);

    res.json(request);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/claude/create-field - Create a custom field from Claude's suggestion
 * Body: { featureRequestId, fieldData: { name, label, type, entityType, options? } }
 * Returns: Created custom field
 */
router.post('/create-field', async (req, res, next) => {
  try {
    const { featureRequestId, fieldData } = req.body;

    if (!featureRequestId) {
      return res.status(400).json({ error: 'Feature request ID is required' });
    }

    if (!fieldData) {
      return res.status(400).json({ error: 'Field data is required' });
    }

    const customField = await createCustomFieldFromSuggestion(featureRequestId, fieldData);

    res.status(201).json(customField);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/claude/feature-requests/:id/status - Update feature request status
 * Body: { status }
 */
router.patch('/feature-requests/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updated = await updateFeatureRequestStatus(id, status);

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
