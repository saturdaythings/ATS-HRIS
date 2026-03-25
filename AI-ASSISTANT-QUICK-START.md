# AI Assistant Quick Start

## How to Use

### 1. Start Services
```bash
# Terminal 1: Backend
cd /Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops
npm run dev

# Terminal 2: Frontend
cd app
npm run dev
# Open http://localhost:5173
```

### 2. Click "Ask" Button
Located in top-right corner of the topbar (right of notifications)

### 3. Type Your Request

#### Query Examples (Read-Only, No Confirmation)
```
"How many candidates in pipeline?"
"Show me all mid-level developers"
"What devices are available?"
"Who is Sofia Reyes?"
"List employees in engineering department"
"How many devices assigned?"
```

#### Action Examples (Requires Confirmation)
```
"Create candidate John Smith"
"Move Sam to interview stage"
"Log interview for Sofia"
"Assign laptop to Jane Doe"
"Return device X from employee Y"
"Mark task 123 as complete"
```

### 4. Confirm Actions
Assistant shows what it will do:
```
I'll create a new candidate with:
- Name: John Smith
- Status: active
- Stage: applied
Ready? Say 'confirm' or 'go' to proceed.
```

Type one of:
- `confirm`
- `yes`
- `go`
- `do it`

### 5. Done!
Assistant confirms the operation and shows results

---

## Command Patterns

### Candidates
```
"Create candidate [Name]"
"Move [Name] to [stage]"
"Set [Name] status to [status]"
"Who is [Name]?"
"How many [seniority level] candidates?"
"Which candidates are in [stage]?"
"Find stale candidates" (inactive 30+ days)
```

**Valid Stages:** applied, screening, interview, offer, hired, rejected
**Valid Statuses:** active, inactive, archived
**Valid Seniorities:** Check your config lists

### Employees
```
"Find [Name]"
"Show [department] team"
"Who is [Name]?"
"How many employees?"
"List active employees"
```

### Devices
```
"Create device [type] [make] [model]"
"Assign [device] to [employee]"
"Return [device] from [employee]"
"List available devices"
"How many devices [status]?"
"Find [device]"
```

**Device Statuses:** available, assigned, retired, damaged

### Interviews
```
"Log interview for [candidate]"
"List upcoming interviews"
"What interviews are next week?"
```

### Onboarding
```
"List onboarding runs"
"Show active onboarding tasks"
```

---

## What You Can Do

### Read Operations (Instant)
- ✅ Search candidates, employees
- ✅ Get full records
- ✅ List devices by status
- ✅ View dashboard summary
- ✅ Check upcoming interviews
- ✅ Find stale candidates
- ✅ View onboarding runs

### Write Operations (With Confirmation)
- ✅ Create candidates
- ✅ Update candidate stage/status
- ✅ Log interviews
- ✅ Create devices
- ✅ Assign devices to employees
- ✅ Record device returns
- ✅ Update task status

---

## Tips & Tricks

1. **Be Specific**
   - "Create candidate Sofia Reyes" ✓ (better)
   - "Create candidate" ✗ (will ask for name)

2. **Use Context**
   - Assistant remembers conversation
   - "Create Sofia" then "Move her to interview"
   - Context carries across messages

3. **Ask for Clarification**
   - If assistant asks questions, answer them
   - Natural back-and-forth is fine
   - One question at a time

4. **Always Confirm Writes**
   - Assistant will show you what it will do
   - Review before confirming
   - Type "confirm" explicitly

5. **Date Formats**
   - Today's date is known
   - "Next Monday" works
   - "2026-03-24" format is fine
   - "Tomorrow", "next week", "3 days from now" understood

---

## Example Conversations

### Example 1: Create Candidate + Interview
```
You: Create candidate Sofia Reyes
Assistant: I'll create a new candidate with:
- Name: Sofia Reyes
- Status: active
- Stage: applied
Ready? Say 'confirm' to proceed.

You: confirm
Assistant: ✓ Created Sofia Reyes as active candidate in applied stage.

You: Log interview for Sofia
Assistant: I'll create an interview record for Sofia Reyes.
- Format: phone (default)
- Date: Today
- Result: to_be_determined
Confirm?

You: yes
Assistant: ✓ Logged phone interview for Sofia Reyes on 2026-03-24.
```

### Example 2: Device Assignment
```
You: List available devices
Assistant: You have 8 available devices:
- MacBook Pro (SN: ABC123)
- Dell Monitor (SN: XYZ789)
[... 6 more ...]

You: Assign MacBook Pro to John Smith
Assistant: I'll assign MacBook Pro to John Smith
- Device: MacBook Pro (SN: ABC123)
- Employee: John Smith
- Condition: excellent
Ready?

You: go
Assistant: ✓ Assigned MacBook Pro to John Smith
```

### Example 3: Query
```
You: How many mid devs in pipeline?
Assistant: You have 5 mid-level developers in the pipeline:
- 2 in screening
- 2 in interview
- 1 in offer stage

Would you like details on any of them?
```

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Click "Ask" | Open/close panel |
| Enter | Send message |
| Escape | Close panel |
| Shift+Enter | (new line in message) |

---

## Troubleshooting

### "Assistant didn't understand"
- Be more specific: "Create candidate [full name]"
- Ask one thing at a time
- Use standard field values

### "Error: Candidate not found"
- Check the name spelling
- Use first/last name format
- Try searching first with "Who is [name]?"

### "Need confirmation"
- If you see "Ready? Say 'confirm'..."
- Type: `confirm` or `yes` or `go`
- Don't forget to confirm!

### Message not sending
- Check internet connection
- Backend might be down: restart with `npm run dev`
- Check browser console for errors (F12)

### Assistant slow to respond
- First message slower (system prompt generation)
- Subsequent messages faster
- Large dataset queries may take 2-3 seconds

---

## Valid Field Values

### Seniority Levels
Check your config lists. Common examples:
- Junior
- Mid-level
- Senior
- Lead
- Principal

### Candidate Sources
- LinkedIn
- Referral
- Job Board
- Recruiter
- Other

### Interview Formats
- Phone
- Video
- In Person
- Take Home

### Device Types
- Laptop
- Monitor
- Mouse
- Keyboard
- Headphones
- Dock
- Cable
- Other

### Device Status
- Available (in inventory, not assigned)
- Assigned (with employee)
- Retired (no longer in use)
- Damaged (broken, being repaired)

---

## Common Issues

| Issue | Solution |
|-------|----------|
| "Message required" error | You sent an empty message. Type something. |
| Panel doesn't open | Refresh page, restart services |
| Slow responses | Network issue or backend slow, wait a moment |
| Can't confirm | Type exactly: `confirm` or `yes` or `go` |
| Assistant created wrong person | Refresh, verify in table before confirming next time |
| Device assigned twice | Each assignment gets unique ID, return it separately |

---

## Best Practices

1. **Always Review Before Confirming**
   - Read what assistant will do
   - Check names and values
   - Confirm intentionally

2. **Use for Common Tasks**
   - Quick candidate creates
   - Status updates
   - Device assignments
   - Interview logging

3. **Ask Questions**
   - "How many junior devs do we have?"
   - "Show me all available devices"
   - Assistant is conversational

4. **Be Explicit About Confirmation**
   - Don't say "ok" or "yep"
   - Say "confirm" or "yes"
   - Assistant is listening for confirmation keywords

5. **Close When Done**
   - Click X or press Escape
   - Conversation history cleared on close
   - Start fresh next time

---

## Support

For issues:
1. Check troubleshooting section above
2. Check backend logs: `npm run dev` output
3. Check browser console: F12 → Console
4. Restart both backend and frontend
5. Check that ANTHROPIC_API_KEY is set

---

**Happy organizing! 🚀**
