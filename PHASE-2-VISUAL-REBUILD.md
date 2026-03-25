# Phase 2 Visual Rebuild — Exact Mockup Matching

**Priority:** 100% visual accuracy to mockup specification
**Model:** Opus 4.6 (all agents, maximum capability)
**Execution:** Parallel agents, 5 independent feature chunks

---

## 1. AI Assistant Panel Rebuild

### Current Issue
- Styling doesn't match mockup (spacing, colors, layout)
- Confirmation cards need exact styling
- Message bubbles need proper border radius and padding

### Specification from Mockup
**Dimensions & Layout:**
- Width: 400px (fixed, flex-shrink: 0)
- Position: Right side, fixed, z-index 40
- Header: 14px title "Ask Oliver" + "Ready" status badge (green)
- Messages: Scrollable area with 16px padding
- Input: textarea + Send button at bottom

**Message Bubbles:**
- User messages: Black background (#111), white text, right-aligned, border-radius: 10px 10px 2px 10px
- Assistant messages: Light gray (#f5f5f5), dark text, left-aligned, border-radius: 10px 10px 10px 2px
- Padding: 9px 12px
- Font: 13px, line-height: 1.5
- Time: 10.5px, #bbb, below each message

**Confirmation Cards:**
- Background: white
- Border: 0.5px solid #e8e8e8
- Border-radius: 8px
- Padding: 12px
- Title: 11.5px, #555, margin-bottom: 8px
- Rows: flex justify-between, font-size: 12.5px, padding: 4px 0
- Keys: #aaa
- Values: #111, font-weight: 500
- Buttons: 2px 7px padding, border-radius: 7px

**Input Area:**
- Padding: 12px 18px
- Display: flex with gap: 8px
- Textarea: flex: 1, min-height: 38px, max-height: 100px, border: 0.5px solid #e0e0e0
- Send button: #111 background, white text, border-radius: 7px

---

## 2. Inline Editing Field Component Rebuild

### Current Issue
- Component exists but CSS not matching mockup exactly
- Spacing and hover states need refinement
- Select fields need proper styling

### Specification from Mockup
**Field Container:**
- margin-bottom: 12px
- position: relative

**Field Label:**
- font-size: 10.5px
- color: #bbb
- text-transform: uppercase
- letter-spacing: 0.06em
- margin-bottom: 3px

**Field Value (display mode):**
- font-size: 13px
- color: #111
- padding: 4px 6px
- border-radius: 5px
- border: 0.5px solid transparent
- cursor: text
- transition: border 0.1s
- line-height: 1.5

**Field Value Hover:**
- border-color: #e0e0e0
- background: #fafafa

**Field Input/Select (editing):**
- font-size: 13px
- color: #111
- padding: 4px 6px
- border-radius: 5px
- border: 0.5px solid #111
- width: 100%
- outline: none
- background: #fff
- font-family: inherit

**Save/Cancel Buttons:**
- gap: 5px
- margin-top: 4px
- Font-size: 11px, padding: 2px 8px, border-radius: 5px
- Save: background #111, color #fff
- Cancel: background #fff, color #555, border: 0.5px solid #e0e0e0

**Edit Hint:**
- font-size: 10.5px
- color: #bbb
- margin-top: 2px

---

## 3. Table Controls & Filters

### Current Issue
- Filter chips not matching mockup styling
- Column visibility dropdown needs exact positioning
- Sort arrows need proper implementation

### Specification from Mockup
**Table Toolbar:**
- display: flex, gap: 7px, padding: 10px 16px
- border-bottom: 0.5px solid #e8e8e8
- background: #fff

**Filter Chips:**
- font-size: 12px, padding: 4px 10px
- border: 0.5px solid #e8e8e8, border-radius: 999px
- color: #555
- background: #fff
- Active state: background #111, color #fff, border-color #111

**Column Toggle Button:**
- font-size: 12px, padding: 4px 10px
- border: 0.5px solid #e8e8e8, border-radius: 7px
- color: #555
- margin-left: auto
- display: flex, gap: 5px

**Column Dropdown:**
- position: absolute, top: 48px, right: 16px
- background: #fff
- border: 0.5px solid #e8e8e8
- border-radius: 10px
- padding: 12px
- width: 200px
- box-shadow: 0 4px 16px rgba(0,0,0,.1)
- z-index: 50

---

## 4. Interview History Cards

### Current Issue
- Interview cards styling not matching mockup
- Interviewer recommendations need color-coding
- Activity timeline needs exact styling

### Specification from Mockup
**Interview Card:**
- border: 0.5px solid #e8e8e8
- border-radius: 8px
- padding: 10px 12px
- margin-bottom: 8px

**Card Header:**
- flex justify-between
- font-size: 12px, font-weight: 500, color #111 (date)
- Format badge: 10px, padding: 1px 6px, border-radius: 999px, background #f5f5f5

**Interviewer Rows:**
- display: flex justify-space-between
- padding: 5px 0
- border-bottom: 0.5px solid #f5f5f5
- Name: 12px, font-weight: 500, color #111
- Role: 11px, color #aaa
- Recommendation: font-weight: 500
  - Hire: #166534 (green)
  - Maybe: #92400e (amber)
  - No: #991b1b (red)

**Feedback Text:**
- font-size: 11.5px, color: #888
- margin-top: 4px
- font-style: italic

---

## 5. Device Assignment History

### Current Issue
- Assignment rows styling not matching mockup
- Current vs. past assignments need visual distinction
- Condition badges need proper styling

### Specification from Mockup
**Assignment Row:**
- border: 0.5px solid #e8e8e8
- border-radius: 8px
- padding: 10px 12px
- margin-bottom: 6px

**Current Assignment (highlighted):**
- border-color: #166534
- background: #f0fdf4
- .assign-name color: #166534

**Past Assignment (grayed):**
- .assign-name color: #555

**Assignment Top:**
- flex justify-space-between
- margin-bottom: 3px

**Assignment Name:**
- font-size: 13px, font-weight: 500, color: #111

**Assignment Dates:**
- font-size: 12px, color: #888

**Condition Badge:**
- font-size: 11px, padding: 1px 6px, border-radius: 999px
- background: #f5f5f5, border: 0.5px solid #e8e8e8, color: #666

---

## Implementation Tasks (5 Chunks)

### Chunk 1: AssistantPanel UI Rebuild
- Rewrite AssistantPanel.jsx to match mockup exactly
- Update assistant.css with exact specifications
- Ensure message styling and confirmation cards match
- Rebuild input area with proper styling

### Chunk 2: InlineField Component Polish
- Update inline-field.css to match mockup specification
- Verify field label, value, input, button styling
- Test edit/save/cancel workflow
- Verify all CSS values match mockup exactly

### Chunk 3: Table Controls & Filters
- Rebuild filter chip styling
- Implement column visibility dropdown with exact positioning
- Add sort arrows to headers
- Ensure toolbar spacing matches mockup

### Chunk 4: Interview History Panel
- Create/update interview card component
- Implement interviewer recommendation colors
- Add activity timeline styling
- Match all spacing and typography to mockup

### Chunk 5: Device Assignment History
- Create/update device assignment component
- Implement current vs. past assignment styling
- Add condition badges
- Match all spacing and border styling to mockup

---

## Visual Reference

All specifications above are derived from:
- File: `/Users/oliver/OliverRepo/workspaces/work/projects/vtwo-ops/vtwo-ops-phase2-mockup_V2.html`
- CSS lines: 1-168
- HTML examples for each feature in respective tab sections

---

## Success Criteria

✅ All 5 features visually match mockup 100%
✅ All spacing, padding, borders match specification
✅ All colors match specification (#111, #bbb, #e8e8e8, etc.)
✅ All typography (font-size, weight, letter-spacing) matches
✅ All interactive states (hover, active, editing) work correctly
✅ Build passes with no visual regressions
✅ All components integrate into existing layout
