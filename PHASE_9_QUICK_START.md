# Phase 9 Quick Start Guide

## What's New

### Backend
- **CSV Export Service** - Export candidates, employees, devices, activity logs
- **Global Search Service** - Search across all entities with filtering and suggestions
- **Export Endpoints** - `/api/exports/*` for data download
- **Search Endpoints** - `/api/search/*` for unified search

### Frontend
- **Reports Page** - Dashboard with export buttons and quick stats
- **Search Page** - Global search interface with type filtering
- **SearchBar Component** - Reusable search input with suggestions

## Quick Test

```bash
# Start server
node server/index.js

# In another terminal, start app
cd app && npm run dev

# Test endpoints
curl http://localhost:3001/api/exports/status
curl http://localhost:3001/api/search/status

# Visit frontend
http://localhost:5173/reports
http://localhost:5173/search
```

## API Examples

### Search
```bash
# Global search
GET /api/search?q=john
GET /api/search?q=jane&types=employees

# Entity-specific search
GET /api/search/candidates?q=john&status=active
GET /api/search/employees?q=jane&department=engineering
GET /api/search/devices?q=SN12345&type=Laptop
GET /api/search/activity?q=created&entityType=candidate

# Get suggestions
GET /api/search/suggestions?prefix=jo
```

### Export
```bash
# Export specific entity type
POST /api/exports/candidates
POST /api/exports/employees
POST /api/exports/devices
POST /api/exports/activity

# Bulk export
POST /api/exports/bulk
Body: {"types": ["candidates", "employees", "devices", "activity"]}
```

## Key Files

**Backend Services:**
- `server/services/exportService.js` - CSV generation logic
- `server/services/searchService.js` - Search logic
- `server/routes/exports.js` - Export endpoints
- `server/routes/search.js` - Search endpoints

**Frontend Pages:**
- `app/src/pages/Reports.jsx` - Reports dashboard
- `app/src/pages/Search.jsx` - Search interface
- `app/src/components/SearchBar.jsx` - Search input component

**Tests:**
- `server/tests/services/exportService.test.js`
- `server/tests/services/searchService.test.js`
- `server/tests/routes/exports.test.js`
- `server/tests/routes/search.test.js`
- `app/src/__tests__/pages/Reports.test.jsx`
- `app/src/__tests__/pages/Search.test.jsx`
- `app/src/__tests__/components/SearchBar.test.jsx`

## Run Tests

```bash
# All tests
npm test

# Specific tests
npm test -- server/tests/routes/exports.test.js
npm test -- server/tests/services/exportService.test.js

# Watch mode
npm test -- --watch
```

## Features

### Export Features
- ✅ CSV formatting with proper escaping
- ✅ Filter preservation (status, stage, department, etc.)
- ✅ Column selection
- ✅ Bulk export all types
- ✅ Soft-deleted record exclusion

### Search Features
- ✅ Global search across all entities
- ✅ Entity-specific search
- ✅ Autocomplete suggestions
- ✅ Type filtering
- ✅ Case-insensitive matching
- ✅ Exact match prioritization

### Reports Features
- ✅ Entity count display
- ✅ Individual export buttons
- ✅ Bulk export button
- ✅ Quick statistics
- ✅ Loading states
- ✅ Error handling

## Troubleshooting

**Search returns no results**
- Ensure at least 2 characters in query
- Check authentication (must be logged in)
- Verify entities exist in database

**Export fails**
- Check authentication
- Verify entity type is valid
- Check server logs for errors

**Suggestions not showing**
- Ensure prefix is at least 2 characters
- Check network tab for API errors
- Clear browser cache if needed

## Performance Tips

- Search results limited to 20 per entity type (by design)
- Activity export limited to 10K records (prevents memory issues)
- Database indexes present for fast search
- API responses cached where possible

## Security Notes

- All endpoints require authentication
- Soft-deleted records excluded from results
- User input validated on all endpoints
- SQL injection prevention via Prisma
- CSRF protection enabled

## Next Steps

1. **Test** - Run full test suite: `npm test`
2. **Deploy** - Deploy to production environment
3. **Monitor** - Check server logs for errors
4. **Iterate** - Gather user feedback for Phase 10

## Support

See `PHASE_9_COMPLETION.md` for:
- Full implementation details
- Security checklist
- Production deployment guide
- Edge cases handled
- Future enhancement ideas
