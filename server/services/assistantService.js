import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db.js';

/**
 * Assistant Service
 * Handles natural language operations for candidates, employees, and devices
 * Integrates with Claude API for conversational interface
 */

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Get system prompt with live database context
 * @returns {Promise<string>} Dynamic system prompt with current data
 */
async function getSystemPrompt() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch configuration lists
    const [sources, seniorities, interviewFormats, skillTags, rejectionReasons] = await Promise.all([
      db.configList.findUnique({
        where: { name: 'candidate_source' },
        include: { items: { orderBy: { order: 'asc' } } },
      }),
      db.configList.findUnique({
        where: { name: 'seniority' },
        include: { items: { orderBy: { order: 'asc' } } },
      }),
      db.configList.findUnique({
        where: { name: 'interview_format' },
        include: { items: { orderBy: { order: 'asc' } } },
      }),
      db.configList.findUnique({
        where: { name: 'skill_tags' },
        include: { items: { orderBy: { order: 'asc' } } },
      }),
      db.configList.findUnique({
        where: { name: 'rejection_reason' },
        include: { items: { orderBy: { order: 'asc' } } },
      }),
    ]);

    const formatList = (items) =>
      items && items.length > 0
        ? items.map((item) => `- ${item.label}`).join('\n')
        : '(empty)';

    return `You are the V.Two Ops AI Assistant. You help manage candidates, employees, devices, onboarding, and offboarding for V.Two, a software development company.

Today's date is ${today}.

## Available Actions

You can perform two types of operations:

### Query Mode (Read-Only)
Use these to answer questions about the system:
- search_candidates: Search by name, stage, status, seniority, skills
- get_candidate: Get full candidate record by ID or name
- search_employees: Search employees
- get_employee: Get full employee record
- list_devices: List devices, optionally filter by status
- get_dashboard_summary: Get counts and current state
- list_upcoming_interviews: Get interviews in next N days
- list_stale_candidates: Get candidates inactive over N days
- list_onboarding_runs: List active onboarding/offboarding runs

### Action Mode (Write Operations)
These require explicit confirmation before execution:
- create_candidate: Create new candidate
- update_candidate: Update candidate (stage, status, dates, etc.)
- log_interview: Log interview result
- create_device: Add device to inventory
- assign_device: Assign device to employee
- return_device: Record device return
- update_task: Mark task complete/skipped

## Confirmation Pattern

CRITICAL: For all write operations, you MUST:
1. Show exactly what you will do
2. Wait for explicit confirmation (yes / confirm / go / do it)
3. Never execute writes without confirmation

Example:
User: "Create candidate Sofia Reyes"
You: "I'll create a new candidate with:
- Name: Sofia Reyes
- Status: active
- Stage: applied
Ready? Say 'confirm' or 'go' to proceed."
User: "confirm"
You: [execute the action]

## Configuration Lists

Candidate sources:
${formatList(sources?.items || [])}

Seniority levels:
${formatList(seniorities?.items || [])}

Interview formats:
${formatList(interviewFormats?.items || [])}

Skill tags:
${formatList(skillTags?.items || [])}

Rejection reasons:
${formatList(rejectionReasons?.items || [])}

## Behavior Rules

1. Always confirm writes before executing
2. Show exactly what you will do and wait for explicit confirmation
3. When information is missing, ask ONE question at a time (never present a form)
4. Infer what you can from context
5. If a name is ambiguous, show a short list and ask which one
6. For relative dates, resolve against today's date
7. For queries returning >10 results, summarize and offer to show all
8. Respond concisely and professionally
9. Use bullet points for clarity

## Example Interactions

User: "How many mid devs in pipeline?"
You: [search_candidates with filter for mid-level seniority in active pipeline]
"You have 5 mid-level developers in the pipeline:
- 2 in screening
- 2 in interview
- 1 in offer"

User: "Move Sam to interviewed"
You: [search_candidates for "Sam"]
"Found 1 candidate named Sam Chen. I'll update their stage to interview. Confirm?"
User: "yes"
You: [execute update]
"Updated Sam Chen to interview stage."

Remember: Keep users in control. Never assume. Always confirm writes.`;
  } catch (error) {
    console.error('Error building system prompt:', error);
    // Fallback prompt
    return `You are the V.Two Ops AI Assistant. Help users manage candidates, employees, and devices.

For write operations, always confirm before executing.
For queries, show results concisely.
If information is missing, ask one question at a time.`;
  }
}

/**
 * Send message to Claude and get response with tool execution
 * @param {string} message - User message
 * @param {Array} history - Conversation history
 * @returns {Promise<Object>} { response, toolCalls }
 */
export async function handleMessage(message, history = []) {
  if (!message) {
    throw new Error('Message is required');
  }

  try {
    const systemPrompt = await getSystemPrompt();

    // Build messages array
    const messages = [
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call Claude with tool definitions
    let response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      tools: getToolDefinitions(),
      messages,
    });

    // Process tool calls
    let toolResults = [];
    for (const block of response.content) {
      if (block.type === 'tool_use') {
        try {
          const result = await executeTool(block.name, block.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        } catch (err) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify({ error: err.message }),
            is_error: true,
          });
        }
      }
    }

    // Get final response
    let finalResponse = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    // If tools were called, make follow-up request
    if (toolResults.length > 0) {
      const followUp = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        tools: getToolDefinitions(),
        messages: [
          ...messages,
          { role: 'assistant', content: response.content },
          {
            role: 'user',
            content: toolResults,
          },
        ],
      });

      finalResponse = followUp.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');
    }

    return {
      response: finalResponse,
      toolCalls: toolResults.length > 0 ? toolResults : [],
    };
  } catch (error) {
    console.error('Assistant error:', error);
    throw error;
  }
}

/**
 * Get tool definitions for Claude
 * @returns {Array} Tool definitions
 */
function getToolDefinitions() {
  return [
    // Read tools
    {
      name: 'search_candidates',
      description:
        'Search candidates by name, stage, status, seniority level, or skill tags. Returns a list of matching candidates.',
      input_schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term (name, skill, or other identifier)',
          },
          filters: {
            type: 'object',
            properties: {
              stage: {
                type: 'string',
                description:
                  'Filter by stage: applied, screening, interview, offer, hired, rejected',
              },
              status: {
                type: 'string',
                description: 'Filter by status: active, inactive, archived',
              },
              seniority: {
                type: 'string',
                description: 'Filter by seniority level',
              },
              source: {
                type: 'string',
                description: 'Filter by recruitment source',
              },
            },
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_candidate',
      description: 'Get full candidate record by ID or name',
      input_schema: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string',
            description: 'Candidate ID or name',
          },
        },
        required: ['identifier'],
      },
    },
    {
      name: 'search_employees',
      description: 'Search employees by name, status, or department',
      input_schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search term (name, email, or identifier)',
          },
          filters: {
            type: 'object',
            properties: {
              status: {
                type: 'string',
                description: 'Filter by status: active, offboarded, on_leave',
              },
              department: {
                type: 'string',
                description: 'Filter by department',
              },
            },
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'get_employee',
      description: 'Get full employee record by ID or name',
      input_schema: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string',
            description: 'Employee ID or name',
          },
        },
        required: ['identifier'],
      },
    },
    {
      name: 'list_devices',
      description: 'List devices in inventory, optionally filtered by status',
      input_schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter by status: available, assigned, retired, damaged',
          },
          limit: {
            type: 'number',
            description: 'Maximum results to return (default: 20)',
          },
        },
      },
    },
    {
      name: 'get_dashboard_summary',
      description:
        'Get high-level dashboard metrics: candidate counts, employee counts, device inventory, onboarding status',
      input_schema: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'list_upcoming_interviews',
      description: 'List interviews scheduled in the next N days',
      input_schema: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Number of days to look ahead (default: 7)',
          },
        },
      },
    },
    {
      name: 'list_stale_candidates',
      description: 'Find candidates who have been inactive for N or more days',
      input_schema: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Number of days of inactivity (default: 30)',
          },
        },
      },
    },
    {
      name: 'list_onboarding_runs',
      description: 'List active onboarding or offboarding runs',
      input_schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter by status: pending, in_progress, complete (default: all)',
          },
        },
      },
    },

    // Write tools (require confirmation)
    {
      name: 'create_candidate',
      description:
        'Create a new candidate. MUST confirm before executing with exact details.',
      input_schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Candidate full name',
          },
          email: {
            type: 'string',
            description: 'Email address',
          },
          roleApplied: {
            type: 'string',
            description: 'Role applied for',
          },
          sourceId: {
            type: 'string',
            description: 'Recruitment source ID',
          },
          seniorityId: {
            type: 'string',
            description: 'Seniority level ID',
          },
          stage: {
            type: 'string',
            description: 'Initial stage (default: applied)',
          },
          status: {
            type: 'string',
            description: 'Initial status (default: active)',
          },
        },
        required: ['name'],
      },
    },
    {
      name: 'update_candidate',
      description:
        'Update candidate fields (stage, status, dates, etc.). MUST confirm before executing.',
      input_schema: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string',
            description: 'Candidate ID or name',
          },
          stage: {
            type: 'string',
            description: 'New stage',
          },
          status: {
            type: 'string',
            description: 'New status',
          },
          notes: {
            type: 'string',
            description: 'Add or update notes',
          },
        },
        required: ['identifier'],
      },
    },
    {
      name: 'log_interview',
      description:
        'Log an interview result. MUST confirm details before executing.',
      input_schema: {
        type: 'object',
        properties: {
          candidateId: {
            type: 'string',
            description: 'Candidate ID',
          },
          format: {
            type: 'string',
            description: 'Interview format (phone, video, in_person)',
          },
          interviewDate: {
            type: 'string',
            description: 'Interview date (YYYY-MM-DD)',
          },
          result: {
            type: 'string',
            description: 'Result: pass, fail, to_be_determined',
          },
          notes: {
            type: 'string',
            description: 'Interview notes',
          },
        },
        required: ['candidateId'],
      },
    },
    {
      name: 'create_device',
      description:
        'Add device to inventory. MUST confirm specifications before executing.',
      input_schema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            description: 'Device type (laptop, monitor, mouse, keyboard, etc.)',
          },
          make: {
            type: 'string',
            description: 'Manufacturer (Apple, Dell, etc.)',
          },
          model: {
            type: 'string',
            description: 'Model name',
          },
          serial: {
            type: 'string',
            description: 'Serial number',
          },
          condition: {
            type: 'string',
            description: 'Condition: new, excellent, good, fair',
          },
        },
        required: ['type', 'make', 'model'],
      },
    },
    {
      name: 'assign_device',
      description:
        'Assign device to employee. MUST confirm before executing.',
      input_schema: {
        type: 'object',
        properties: {
          deviceId: {
            type: 'string',
            description: 'Device ID',
          },
          employeeId: {
            type: 'string',
            description: 'Employee ID',
          },
          condition: {
            type: 'string',
            description: 'Condition when assigned',
          },
          notes: {
            type: 'string',
            description: 'Assignment notes',
          },
        },
        required: ['deviceId', 'employeeId'],
      },
    },
    {
      name: 'return_device',
      description: 'Record device return from employee. MUST confirm before executing.',
      input_schema: {
        type: 'object',
        properties: {
          assignmentId: {
            type: 'string',
            description: 'Assignment ID',
          },
          returnedDate: {
            type: 'string',
            description: 'Return date (YYYY-MM-DD)',
          },
          condition: {
            type: 'string',
            description: 'Condition when returned',
          },
          notes: {
            type: 'string',
            description: 'Return notes',
          },
        },
        required: ['assignmentId'],
      },
    },
    {
      name: 'update_task',
      description: 'Mark task complete or skipped. MUST confirm before executing.',
      input_schema: {
        type: 'object',
        properties: {
          taskId: {
            type: 'string',
            description: 'Task ID',
          },
          status: {
            type: 'string',
            description: 'New status: complete, skipped',
          },
          notes: {
            type: 'string',
            description: 'Completion notes',
          },
        },
        required: ['taskId', 'status'],
      },
    },
  ];
}

/**
 * Execute a tool call
 * @param {string} toolName - Tool name
 * @param {Object} input - Tool input
 * @returns {Promise<Object>} Tool result
 */
async function executeTool(toolName, input) {
  switch (toolName) {
    case 'search_candidates':
      return searchCandidates(input.query, input.filters);
    case 'get_candidate':
      return getCandidate(input.identifier);
    case 'search_employees':
      return searchEmployees(input.query, input.filters);
    case 'get_employee':
      return getEmployee(input.identifier);
    case 'list_devices':
      return listDevices(input.status, input.limit);
    case 'get_dashboard_summary':
      return getDashboardSummary();
    case 'list_upcoming_interviews':
      return listUpcomingInterviews(input.days);
    case 'list_stale_candidates':
      return listStaleCandidates(input.days);
    case 'list_onboarding_runs':
      return listOnboardingRuns(input.status);
    case 'create_candidate':
      return createCandidate(input);
    case 'update_candidate':
      return updateCandidate(input.identifier, input);
    case 'log_interview':
      return logInterview(input);
    case 'create_device':
      return createDevice(input);
    case 'assign_device':
      return assignDevice(input);
    case 'return_device':
      return returnDevice(input);
    case 'update_task':
      return updateTask(input);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ============================================================================
// Read Tool Implementations
// ============================================================================

async function searchCandidates(query, filters = {}) {
  const where = {
    OR: [{ name: { contains: query, mode: 'insensitive' } }],
  };

  if (filters.stage) where.stage = filters.stage;
  if (filters.status) where.status = filters.status;
  if (filters.seniority) where.seniorityId = filters.seniority;
  if (filters.source) where.sourceId = filters.source;

  const candidates = await db.candidate.findMany({
    where,
    include: {
      source: { select: { label: true } },
      seniority: { select: { label: true } },
    },
    take: 10,
  });

  return {
    count: candidates.length,
    candidates: candidates.map((c) => ({
      id: c.id,
      name: c.name,
      stage: c.stage,
      status: c.status,
      roleApplied: c.roleApplied,
      seniority: c.seniority?.label,
      source: c.source?.label,
    })),
  };
}

async function getCandidate(identifier) {
  let candidate = await db.candidate.findFirst({
    where: {
      OR: [{ id: identifier }, { name: { contains: identifier, mode: 'insensitive' } }],
    },
    include: {
      source: { select: { label: true } },
      seniority: { select: { label: true } },
      interviews: { orderBy: { interviewDate: 'desc' }, take: 5 },
      offer: true,
    },
  });

  if (!candidate) {
    throw new Error(`Candidate not found: ${identifier}`);
  }

  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    stage: candidate.stage,
    status: candidate.status,
    roleApplied: candidate.roleApplied,
    seniority: candidate.seniority?.label,
    source: candidate.source?.label,
    createdAt: candidate.createdAt,
    recentInterviews: candidate.interviews.slice(0, 3),
    offer: candidate.offer,
  };
}

async function searchEmployees(query, filters = {}) {
  const where = {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { email: { contains: query, mode: 'insensitive' } },
    ],
  };

  if (filters.status) where.status = filters.status;
  if (filters.department) where.department = filters.department;

  const employees = await db.employee.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      status: true,
      startDate: true,
    },
    take: 10,
  });

  return {
    count: employees.length,
    employees,
  };
}

async function getEmployee(identifier) {
  const employee = await db.employee.findFirst({
    where: {
      OR: [
        { id: identifier },
        { name: { contains: identifier, mode: 'insensitive' } },
        { email: { contains: identifier, mode: 'insensitive' } },
      ],
    },
    include: {
      assignments: { where: { returnedDate: null } },
    },
  });

  if (!employee) {
    throw new Error(`Employee not found: ${identifier}`);
  }

  return {
    id: employee.id,
    name: employee.name,
    email: employee.email,
    department: employee.department,
    status: employee.status,
    startDate: employee.startDate,
    assignedDevices: employee.assignments.length,
  };
}

async function listDevices(status, limit = 20) {
  const where = status ? { status } : {};

  const devices = await db.device.findMany({
    where,
    select: {
      id: true,
      type: true,
      make: true,
      model: true,
      serial: true,
      status: true,
      condition: true,
    },
    take: limit,
  });

  return {
    count: devices.length,
    devices,
  };
}

async function getDashboardSummary() {
  const [activeCandidates, activeEmployees, availableDevices, totalDevices, activeOnboarding] =
    await Promise.all([
      db.candidate.count({ where: { status: 'active' } }),
      db.employee.count({ where: { status: 'active' } }),
      db.device.count({ where: { status: 'available' } }),
      db.device.count({}),
      db.onboardingRun.count({ where: { status: 'in_progress' } }),
    ]);

  return {
    candidates: activeCandidates,
    employees: activeEmployees,
    devices: {
      total: totalDevices,
      available: availableDevices,
      assigned: totalDevices - availableDevices,
    },
    onboardingInProgress: activeOnboarding,
  };
}

async function listUpcomingInterviews(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const interviews = await db.interview.findMany({
    where: {
      interviewDate: {
        gte: new Date(),
        lte: futureDate,
      },
    },
    include: {
      candidate: { select: { id: true, name: true } },
    },
    orderBy: { interviewDate: 'asc' },
    take: 10,
  });

  return {
    count: interviews.length,
    interviews: interviews.map((i) => ({
      id: i.id,
      candidateName: i.candidate.name,
      candidateId: i.candidate.id,
      date: i.interviewDate,
      format: i.format,
    })),
  };
}

async function listStaleCandidates(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const candidates = await db.candidate.findMany({
    where: {
      status: 'active',
      updatedAt: { lte: cutoffDate },
    },
    select: {
      id: true,
      name: true,
      stage: true,
      updatedAt: true,
    },
    take: 10,
  });

  return {
    count: candidates.length,
    candidates,
  };
}

async function listOnboardingRuns(status) {
  const where = status ? { status } : {};

  const runs = await db.onboardingRun.findMany({
    where,
    include: {
      employee: { select: { id: true, name: true } },
      tasks: { select: { id: true, title: true, status: true } },
    },
    take: 10,
  });

  return {
    count: runs.length,
    runs: runs.map((r) => ({
      id: r.id,
      employeeName: r.employee?.name,
      type: r.type,
      status: r.status,
      taskCount: r.tasks.length,
    })),
  };
}

// ============================================================================
// Write Tool Implementations
// ============================================================================

async function createCandidate(input) {
  const { name, email, roleApplied, sourceId, seniorityId, stage = 'applied', status = 'active' } =
    input;

  if (!name) throw new Error('Name is required');

  const candidate = await db.candidate.create({
    data: {
      name,
      email: email || null,
      roleApplied: roleApplied || 'Unspecified',
      stage,
      status,
      sourceId: sourceId || null,
      seniorityId: seniorityId || null,
    },
  });

  return {
    success: true,
    candidate: {
      id: candidate.id,
      name: candidate.name,
      stage: candidate.stage,
      status: candidate.status,
    },
  };
}

async function updateCandidate(identifier, input) {
  const candidate = await db.candidate.findFirst({
    where: {
      OR: [{ id: identifier }, { name: { contains: identifier, mode: 'insensitive' } }],
    },
  });

  if (!candidate) {
    throw new Error(`Candidate not found: ${identifier}`);
  }

  const updateData = {};
  if (input.stage) updateData.stage = input.stage;
  if (input.status) updateData.status = input.status;
  if (input.notes) updateData.notes = input.notes;

  const updated = await db.candidate.update({
    where: { id: candidate.id },
    data: updateData,
  });

  return {
    success: true,
    candidate: {
      id: updated.id,
      name: updated.name,
      stage: updated.stage,
      status: updated.status,
    },
  };
}

async function logInterview(input) {
  const { candidateId, format, interviewDate, result = 'to_be_determined', notes } = input;

  if (!candidateId) throw new Error('Candidate ID is required');

  const interview = await db.interview.create({
    data: {
      candidateId,
      format: format || 'phone',
      interviewDate: interviewDate ? new Date(interviewDate) : new Date(),
      result,
      notes: notes || null,
    },
  });

  return {
    success: true,
    interview: {
      id: interview.id,
      candidateId: interview.candidateId,
      format: interview.format,
      result: interview.result,
    },
  };
}

async function createDevice(input) {
  const { type, make, model, serial, condition = 'new' } = input;

  if (!type || !make || !model) {
    throw new Error('Type, make, and model are required');
  }

  const device = await db.device.create({
    data: {
      type,
      make,
      model,
      serial: serial || null,
      status: 'available',
      condition,
    },
  });

  return {
    success: true,
    device: {
      id: device.id,
      type: device.type,
      make: device.make,
      model: device.model,
      serial: device.serial,
      status: device.status,
    },
  };
}

async function assignDevice(input) {
  const { deviceId, employeeId, condition, notes } = input;

  if (!deviceId || !employeeId) {
    throw new Error('Device ID and employee ID are required');
  }

  const device = await db.device.findUnique({ where: { id: deviceId } });
  if (!device) throw new Error('Device not found');

  const employee = await db.employee.findUnique({ where: { id: employeeId } });
  if (!employee) throw new Error('Employee not found');

  const assignment = await db.deviceAssignment.create({
    data: {
      deviceId,
      employeeId,
      assignedDate: new Date(),
      condition: condition || device.condition,
      notes: notes || null,
    },
  });

  // Update device status
  await db.device.update({
    where: { id: deviceId },
    data: { status: 'assigned' },
  });

  return {
    success: true,
    assignment: {
      id: assignment.id,
      deviceId: assignment.deviceId,
      employeeId: assignment.employeeId,
      assignedDate: assignment.assignedDate,
    },
  };
}

async function returnDevice(input) {
  const { assignmentId, returnedDate, condition, notes } = input;

  if (!assignmentId) throw new Error('Assignment ID is required');

  const assignment = await db.deviceAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) throw new Error('Assignment not found');

  const updated = await db.deviceAssignment.update({
    where: { id: assignmentId },
    data: {
      returnedDate: returnedDate ? new Date(returnedDate) : new Date(),
      returnCondition: condition || null,
      returnNotes: notes || null,
    },
  });

  // Update device status back to available
  await db.device.update({
    where: { id: assignment.deviceId },
    data: { status: 'available' },
  });

  return {
    success: true,
    assignment: {
      id: updated.id,
      returnedDate: updated.returnedDate,
      returnCondition: updated.returnCondition,
    },
  };
}

async function updateTask(input) {
  const { taskId, status, notes } = input;

  if (!taskId || !status) {
    throw new Error('Task ID and status are required');
  }

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error('Task not found');

  const updated = await db.task.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === 'complete' ? new Date() : null,
      notes: notes ? task.notes ? `${task.notes}\n${notes}` : notes : task.notes,
    },
  });

  return {
    success: true,
    task: {
      id: updated.id,
      title: updated.title,
      status: updated.status,
    },
  };
}

export default {
  handleMessage,
  getSystemPrompt,
};
