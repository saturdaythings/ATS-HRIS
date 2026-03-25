# V.Two Ops - Backend Server

Express.js API server for V.Two Ops, a unified people & asset management platform.

## Quick Start

### Prerequisites
- Node.js 16+ (with npm or yarn)
- SQLite (included via Prisma)

### Installation & Setup

1. Install dependencies (from project root):
   ```bash
   npm install
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Initialize the database:
   ```bash
   npm run db:push
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will run on **http://0.0.0.0:3001** (accessible on all network interfaces).

## Access Methods

- **Localhost**: http://localhost:3001
- **Loopback**: http://127.0.0.1:3001
- **Network**: http://<your-machine-ip>:3001
- **All interfaces**: http://0.0.0.0:3001 (server binding only)

## Development

Start the server in watch mode:
```bash
npm run dev
```

## Environment Variables

See `.env.example` for all available options:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `DATABASE_URL` | file:./dev.db | SQLite database path |
| `FRONTEND_URL` | (none) | Production frontend URL |
| `SESSION_SECRET` | dev-secret-change-in-prod | Session encryption key |
| `ANTHROPIC_API_KEY` | (optional) | Claude AI API key |

## API Endpoints

### Health & Status
- `GET /api/health` - Server health check
- `GET /api/admin/health` - Admin health check

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### Core Resources
- `GET/POST /api/candidates` - Candidate management
- `GET/POST /api/employees` - Employee records
- `GET/POST /api/interviews` - Interview tracking
- `GET/POST /api/offers` - Offer management
- `GET/POST /api/devices` - Device inventory
- `GET/POST /api/onboarding` - Onboarding workflows

### Settings & Configuration
- `GET/POST /api/settings` - User settings
- `GET/POST /api/admin/settings` - Admin settings
- `GET/POST /api/config-lists` - Configuration lists

### Admin Features
- `GET/POST /api/admin/templates` - Email templates
- `GET/POST /api/admin/custom-fields` - Custom field definitions
- `GET/POST /api/admin/feature-requests` - Feature requests

### Data & Reporting
- `GET /api/dashboard` - Dashboard data
- `GET /api/exports` - Data exports
- `GET /api/search` - Full-text search
- `GET /api/assistant` - AI assistant endpoints

## CORS Configuration

The server allows requests from:
- Development: `localhost:3000`, `localhost:3001`, `localhost:5173`, `localhost:8000`, `localhost:8080`
- Production: URLs specified in `FRONTEND_URL` environment variable
- Special patterns: GitHub Pages (*.github.io), Vercel (*.vercel.app)

For custom domains, set `FRONTEND_URL` in `.env` or as an environment variable.

## Database

Uses Prisma ORM with SQLite by default. To modify schema:

1. Edit `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name <migration_name>`
3. Apply migration: `npm run db:push`

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Watch mode (development):
```bash
npm run test:watch
```

## Deployment

### Docker

Build and run with Docker (see `Dockerfile` in project root):

```bash
docker build -t vtwo-ops-server .
docker run -p 3001:3001 \
  -e PORT=3001 \
  -e NODE_ENV=production \
  -e FRONTEND_URL=https://your-domain.com \
  vtwo-ops-server
```

### Environment-Specific Configuration

**Development:**
```bash
NODE_ENV=development npm start
```

**Production:**
```bash
NODE_ENV=production FRONTEND_URL=https://your-domain.com npm start
```

### Key Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `SESSION_SECRET` to a random string
- [ ] Set `FRONTEND_URL` to your frontend domain
- [ ] Use a production database (not file-based SQLite)
- [ ] Enable HTTPS/SSL in reverse proxy
- [ ] Set up proper logging and monitoring
- [ ] Configure backup strategy for database
- [ ] Review and restrict CORS origins as needed

## Logging

Server startup logs include:
```
✓ Server running on http://0.0.0.0:3001
✓ Local access: http://localhost:3001
✓ Network access: http://<your-ip>:3001
✓ API docs available at http://localhost:3001/api/health
```

## Troubleshooting

### Port Already in Use
```bash
# Change port with environment variable
PORT=3002 npm start

# Or find and kill process using port 3001
lsof -i :3001
kill -9 <PID>
```

### Database Connection Error
```bash
# Reset database and migrations
rm -f dev.db
npm run db:push
npm run db:seed
```

### CORS Issues
1. Verify frontend URL is in origins list
2. Check `FRONTEND_URL` environment variable
3. Review `server/index.js` getCorsOptions()

## Support

For issues or questions, check the main project README at the repository root.
