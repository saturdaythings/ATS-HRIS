# Admin Panel + Claude Integration Architecture

**Status:** Design Document for Phase 2 Enhancement
**Date:** 2026-03-23
**Purpose:** Enable non-technical users to manage system config and request features via Claude

---

## Overview

### Problem
Oliver currently has to:
1. Edit code to add custom fields (t-shirt size, certifications, etc.)
2. Ask Claude to implement new features
3. Wait for implementation, testing, deployment

### Solution
1. **Admin Panel:** Self-service custom field builder, template manager, system settings
2. **Claude Chat Widget:** In-app chat → feature request → Claude → auto-implements → user reviews
3. **Custom Fields:** Dynamic, polymorphic storage (works with Candidates, Employees, Devices)

---

## Architecture

### 1. Custom Fields System

**Data Model (Prisma):**

```prisma
model CustomField {
  id        String   @id @default(cuid())
  name      String   // "tshirt_size", "security_clearance"
  label     String   // "T-Shirt Size" (display)
  type      String   // "text", "select", "date", "checkbox", "number"
  entityType String  // "candidate", "employee", "device"

  // For select/radio types
  options   String?  // JSON array: ["XS", "S", "M", "L", "XL"]

  // Validation
  required  Boolean  @default(false)
  regex     String?  // Optional validation regex

  // Metadata
  order     Int      @default(999) // Field display order
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([entityType, name])
  @@index([entityType])
}

model CustomFieldValue {
  id            String   @id @default(cuid())
  customFieldId String
  customField   CustomField @relation(fields: [customFieldId], references: [id], onDelete: Cascade)

  // Polymorphic reference
  entityType    String  // "candidate", "employee"
  entityId      String  // UUID of candidate/employee

  // Value storage (flexible)
  value         String?  // Stores any type as JSON string

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([customFieldId, entityType, entityId])
  @@index([entityId, entityType])
}
```

**Example Usage:**
```javascript
// Admin creates custom field
const tshirtField = await db.customField.create({
  data: {
    name: "tshirt_size",
    label: "T-Shirt Size",
    type: "select",
    entityType: "employee",
    options: JSON.stringify(["XS", "S", "M", "L", "XL", "XXL"]),
    required: false,
    order: 1,
  },
});

// When hiring employee, store custom value
await db.customFieldValue.create({
  data: {
    customFieldId: tshirtField.id,
    entityType: "employee",
    entityId: employeeId,
    value: "M",
  },
});

// When viewing employee, fetch all custom fields
const customValues = await db.customFieldValue.findMany({
  where: { entityId: employeeId, entityType: "employee" },
  include: { customField: true },
});
```

### 2. Admin Panel Routes

```
GET    /api/admin/custom-fields               # List all
POST   /api/admin/custom-fields               # Create field
PATCH  /api/admin/custom-fields/:id           # Update field
DELETE /api/admin/custom-fields/:id           # Delete field (inactive)
GET    /api/admin/custom-fields/entity/:type  # Fields for entity type

GET    /api/admin/templates                   # Onboarding templates
POST   /api/admin/templates                   # Create template
PATCH  /api/admin/templates/:id               # Update
DELETE /api/admin/templates/:id               # Delete

GET    /api/admin/departments                 # List departments
POST   /api/admin/departments                 # Create
PATCH  /api/admin/departments/:id             # Update

GET    /api/admin/settings                    # System config
PATCH  /api/admin/settings                    # Update (notifications, email, etc.)

GET    /api/admin/feature-requests            # List pending/completed feature requests
POST   /api/admin/feature-requests            # Create from chat
GET    /api/admin/feature-requests/:id        # Get status + Claude response
```

### 3. Claude Chat Integration

**Architecture:**
```
User types in chat widget
  ↓
Frontend sends message to /api/claude/chat endpoint
  ↓
Backend receives message, calls Claude API
  ↓
Claude responds with:
  - Simple answer (question about system)
  - Feature request (structured task)
  - Code snippet (to be implemented)
  ↓
Backend stores request in FeatureRequest table
  ↓
If feature is simple enough (Phase 2), auto-implement
  ↓
If feature needs code, mark as "pending_review"
  ↓
User reviews in admin panel, approves
  ↓
Auto-deploy or notify for manual merge
```

**Data Model:**

```prisma
model FeatureRequest {
  id           String   @id @default(cuid())
  title        String
  description  String

  status       String   @default("requested")
  // requested → reviewing → implementing → testing → deployed → rejected

  type         String   // "config_change", "custom_field", "api_endpoint", "ui_page"

  // Claude context
  originalMessage String
  claudeResponse  String  // Full Claude response

  // Implementation
  implementation  String? // Code or config changes
  estimatedHours  Float?  // Claude's estimate

  createdAt    DateTime @default(now())
  completedAt  DateTime?

  @@index([status])
  @@index([createdAt])
}

model ChatMessage {
  id        String   @id @default(cuid())
  userId    String   // "admin" for now (single user Phase 2)
  role      String   // "user" | "assistant"
  content   String

  relatedFeatureRequestId String? // Links to feature request if applicable

  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

### 4. Claude Chat Backend Implementation

**Endpoint: POST /api/claude/chat**

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function handleClaudeChat(message) {
  // 1. Get chat history
  const history = await db.chatMessage.findMany({
    where: { userId: "admin" },
    orderBy: { createdAt: "asc" },
    take: 20, // Last 20 messages
  });

  // 2. Build system prompt with V.Two Ops context
  const systemPrompt = `You are Claude, helping manage V.Two Ops - a people & asset management platform.

Current system status:
- Custom fields enabled: ${customFieldCount} defined
- Employees: ${employeeCount}
- Devices: ${deviceCount}
- Onboarding templates: ${templateCount}

User's request might be:
1. Questions about the system ("How many employees do we have?")
2. Feature requests ("Add a field for security clearance level")
3. Configuration changes ("Change notification timing to 1 day before")

For feature requests, be specific:
- Describe what needs to be built
- Estimate effort (simple/medium/complex)
- Suggest implementation approach

If it's a simple config change, offer to auto-implement immediately.
If it's a code change, propose a structured plan.`;

  // 3. Call Claude API
  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ],
  });

  const assistantMessage = response.content[0].text;

  // 4. Store both messages
  await db.chatMessage.create({
    data: { userId: "admin", role: "user", content: message },
  });

  const storedResponse = await db.chatMessage.create({
    data: {
      userId: "admin",
      role: "assistant",
      content: assistantMessage,
    },
  });

  // 5. Check if response mentions feature request
  if (
    assistantMessage.includes("I can implement") ||
    assistantMessage.includes("feature")
  ) {
    // Create feature request ticket
    await db.featureRequest.create({
      data: {
        title: extractTitle(assistantMessage),
        description: assistantMessage,
        status: "requested",
        type: inferType(assistantMessage),
        originalMessage: message,
        claudeResponse: assistantMessage,
      },
    });
  }

  return {
    message: assistantMessage,
    relatedFeatureRequest: null, // Could extract if created
  };
}
```

---

## Admin Panel Pages

### 1. Custom Fields Manager
**Path:** `/admin/custom-fields`

- **Left:** List of custom fields (Candidates, Employees, Devices tabs)
- **Right:** Form to create/edit field
  - Name (required, snake_case)
  - Label (display name)
  - Type (dropdown: text, select, date, checkbox, number)
  - Options (if select type)
  - Required checkbox
  - Order (drag to reorder)
  - Active toggle
- **Actions:** Create, Edit, Delete (deactivate), Export
- **Preview:** See how field appears in forms

### 2. Onboarding Templates Manager
**Path:** `/admin/onboarding-templates`

- **Left:** List of templates (Engineering, Design, Sales, etc.)
- **Right:** Template editor
  - Name
  - Apply to roles (multi-select)
  - Timeline buckets (Pre-board, Day 1, Week 1, Month 1, Month 3)
  - Per bucket:
    - Add task (name, assignee, due date relative to start)
    - Drag to reorder tasks
    - Mark required
- **Actions:** Create, Clone, Delete, Export/Import

### 3. Settings
**Path:** `/admin/settings`

- **Company Info**
  - Company name, logo
  - Default timezone

- **Email & Notifications**
  - Email template list (edit templates)
  - Reminder timing: 3 days before, 1 day before, on due, daily overdue
  - Notification types: task, hire, offboard, reminder

- **User Management** (Phase 2B)
  - Create users (HR, IT, Manager roles)
  - Assign permissions

- **Integrations** (Phase 3)
  - Google Drive API key (for resume storage)
  - Slack webhook (for notifications)
  - SMTP config (for email)

### 4. Feature Requests Dashboard
**Path:** `/admin/feature-requests`

- **Status tabs:** Requested, Reviewing, Implementing, Testing, Deployed, Rejected
- **Per request:**
  - Title, description, original message
  - Claude's response and estimate
  - Implementation code (if available)
  - Approve / Reject buttons
  - Deployment status
- **Chat history sidebar:** View conversation that led to request

### 5. System Health
**Path:** `/admin/health`

- **Stats:**
  - Total employees, candidates, devices
  - Onboarding completion rate
  - Device assignment coverage
  - Overdue tasks count

- **Recent activity:** Last 10 hires, completions, etc.
- **Notifications queue:** Pending reminders

---

## Claude Integration Details

### What Claude Can Do (Phase 2)

**✓ Simple:**
- Answer questions about system stats
- Create custom fields (safe, validated)
- Create onboarding templates (safe)
- Change notification timing
- Edit email template text

**✗ Requires Review:**
- Add new API endpoints
- Create new pages
- Complex logic
- Database migrations

### What We Auto-Implement

1. **Custom Field Creation**
   - User: "Add a custom field for security clearance"
   - Claude: "I'll create a select field with options for clearance levels. What options do you want?"
   - User: "Secret, Top Secret, Unclassified"
   - Claude: Creates field immediately, confirms in UI

2. **Template Creation**
   - User: "Create a Sales team onboarding template"
   - Claude: Suggests standard tasks (CRM setup, intro calls, deal desk training, etc.)
   - User: "Looks good"
   - Claude: Creates template, applies to Sales role

3. **Settings Changes**
   - User: "Send reminder 2 days before instead of 3"
   - Claude: Updates config, confirms change

### What Requires Human Review

1. **New API Endpoints**
   - Claude: "I'll create a POST /api/bulk-assign endpoint for batch device assignment"
   - System: Creates feature request, shows proposed code
   - User: Reviews in admin panel, approves deployment

2. **New React Pages**
   - Claude: "I'll add a reports dashboard showing hiring trends"
   - System: Creates feature request with implementation plan
   - User: Approves, code is merged

---

## Integration with Phase 2 Chunks

**New chunks for admin/Claude:**

- **Chunk-13:** Custom fields schema + service
- **Chunk-14:** Admin panel UI (custom fields, templates, settings)
- **Chunk-15:** Claude chat widget + backend integration

**Modified chunks:**

- **Chunk-7, 8, 9:** Update forms to include dynamic custom fields
- **All components:** Support custom field rendering

---

## Security Considerations

1. **Admin-only routes:** All `/api/admin/*` routes require admin permission
2. **Claude API key:** Stored in `.env`, never exposed to frontend
3. **Feature request review:** No auto-deployment of complex changes
4. **Validation:** All custom field values validated against field type
5. **Audit trail:** All admin actions logged in activity feed

---

## Implementation Notes

### Phase 2 (This Phase)
- ✓ Custom field schema + basic CRUD
- ✓ Admin panel for custom fields
- ✓ Admin panel for templates and settings
- ✓ Claude chat widget (messages stored, feature requests created)
- ✓ Auto-implement custom fields + template creation
- ✓ Feature request board (review, approve, reject)

### Phase 3 (Next)
- Admin users system (HR, IT, Manager, Admin roles)
- Claude auto-implementation of endpoints (with guard rails)
- Bulk operations (bulk offboard, bulk device assign)
- Advanced reports builder (let Claude design reports)

---

## User Flow Example

**Oliver wants to track "Security Clearance Level" for employees**

1. Opens admin panel → Custom Fields
2. Clicks "Create Field"
3. Fills form:
   - Name: security_clearance_level
   - Label: Security Clearance
   - Type: select
   - Options: None, Secret, Top Secret
   - Required: yes
   - Apply to: employee
4. Saves
5. Field immediately appears in employee creation form
6. Can edit existing employees to add clearance level

**Or, via Claude:**

1. Opens chat widget in admin panel
2. Types: "Add a field for security clearance with None, Secret, Top Secret options"
3. Claude: "I can create that for you. Should this be required? What other clearance levels?"
4. Oliver: "Optional. Those three are enough."
5. Claude: "Creating field now..."
6. Field is auto-created
7. Oliver sees confirmation in chat

---

## Success Criteria

- [ ] Custom fields fully functional (create, read, update, delete)
- [ ] Custom fields appear in all forms dynamically
- [ ] Admin panel accessible and intuitive
- [ ] Claude chat widget works (messages stored, responses given)
- [ ] Feature requests auto-created from chat
- [ ] Simple changes auto-implemented (custom fields, templates)
- [ ] Complex changes require review/approval
- [ ] No breaking changes to Phase 1 data
- [ ] All tests passing
- [ ] Docs complete

---

## Files to Create/Modify

**Prisma:**
- Extend `schema.prisma` with CustomField, CustomFieldValue, FeatureRequest, ChatMessage

**Backend:**
- `server/services/customFieldService.js` (new)
- `server/services/claudeService.js` (new)
- `server/routes/admin.js` (new, all admin endpoints)
- `server/routes/claude.js` (new, chat endpoint)
- Extend existing services to support custom fields

**Frontend:**
- `app/src/pages/admin/CustomFields.jsx` (new)
- `app/src/pages/admin/Templates.jsx` (new)
- `app/src/pages/admin/Settings.jsx` (new)
- `app/src/pages/admin/FeatureRequests.jsx` (new)
- `app/src/pages/admin/Health.jsx` (new)
- `app/src/components/ClaudeChat.jsx` (new, chat widget)
- `app/src/hooks/useClaudeChat.js` (new)
- `app/src/hooks/useCustomFields.js` (new)
- Update forms to render custom fields dynamically

**Configuration:**
- `.env.example`: Add ANTHROPIC_API_KEY

---

## This Completes Your Request

You now have:
1. **Full team coordination** via subagent-driven-development
2. **Admin panel** for non-technical management
3. **Claude integration** for feature requests + chat
4. **Custom fields** for unlimited extensibility (t-shirt size example)
5. **Email templates** (send manually Phase 2, auto Phase 3)

All tied together in **15 execution chunks** ready for parallel team dispatch.
