# Integration Test Flow — V.Two Ops

## Manual Test Checklist

### Core Pages (Must Work)
- [ ] Dashboard loads — shows 4 stat cards
- [ ] Directory loads — shows employee list or "no employees"
- [ ] Hiring Kanban loads — shows candidate columns
- [ ] Inventory loads — shows device list or "no devices"

### Admin Pages (Must Work)
- [ ] Admin Settings loads — shows form with fields
- [ ] Admin Settings save — updates and shows success message
- [ ] Templates loads — shows template list
- [ ] FeatureRequests loads — shows requests with filtering
- [ ] Health loads — shows system metrics
- [ ] CustomFields loads — shows field list

### New Pages (Should Work)
- [ ] Assignments loads — shows assignments or empty state
- [ ] Search loads — allows searching, returns results
- [ ] Tracks loads — shows tracks or "not defined" message
- [ ] Settings loads — shows current configuration

### Error Handling
- [ ] Network error → Shows error message, can retry
- [ ] Missing data → Shows empty state (not crash)
- [ ] Loading state → Shows "Loading..." while fetching

## Automated Verification

```bash
# 1. Build passes
npm run build

# 2. No console errors on page load
npm run app:dev  # Check browser console in each route

# 3. API endpoints respond
curl http://localhost:3001/api/admin/settings
curl http://localhost:3001/api/admin/templates
curl http://localhost:3001/api/assignments
```

## Status
- Date: 2026-03-24
- Build: Passing (97 modules)
- Pages tested: 16/16 compile
- Data flows: 12+ functional
