# 🚀 Quick Start Guide

Get your Pixel Office Dashboard running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd pixel-office-dashboard
npm install
```

## Step 2: Configure Atlassian

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
CONFLUENCE_URL=https://pinger.atlassian.net/wiki
CONFLUENCE_USERNAME=jjohnson@pinger.com
CONFLUENCE_API_TOKEN=your-token-here
```

**Where to get your API token:**
1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Copy and paste into `.env`

## Step 3: Run!

```bash
npm run dev
```

This starts:
- Backend server on `ws://localhost:8080`
- Frontend dev server on `http://localhost:5173`

Your browser should open automatically to the dashboard!

## What You'll See

A 10-room office building with:
- **Floor 2:** Engineering, QA, Advertising, Eng Platform, Product Management
- **Floor 1:** Operations, Data Warehouse, IT Support, Marketing, Office Management

Each room shows:
- Department name
- Current state (IDLE, ACTIVE, BLOCKED, etc.)
- Character count (placeholder dots for now)
- Color-coded lighting

## Expected Behavior

**First run:**
- All rooms will be IDLE (no real data yet)
- You'll see 10 colored rooms with department names
- White dots represent team members (placeholders)

**After MCP integration works:**
- Rooms will update every 30-120 seconds
- States will change based on actual Confluence/Jira activity
- QA might show BLOCKED (war room)
- Eng might show CRUNCH (high activity)
- Some rooms might be OFF-HOURS (no activity)

## Troubleshooting

**"Cannot connect to server"**
- Backend didn't start - check terminal for errors
- Try running separately: `npm run server` (separate terminal)

**"All rooms are IDLE"**
- Normal on first run (mock data)
- Check `.env` credentials are correct
- Verify Confluence URL format: `https://domain.atlassian.net/wiki`

**"Module not found"**
- Run `npm install` again
- Delete `node_modules` and reinstall

## Next Steps

1. **Add Real Sprites** - See `assets/README.md`
2. **Deploy** - See main `README.md` deployment section
3. **Customize** - Edit `shared/department-config.js`

## Testing Different States

Want to see all room states in action?

**Create test scenarios in Confluence:**
1. Create page titled "War Room - Test" → Triggers BLOCKED
2. Create page titled "Release v1.0" → Triggers SHIPPING
3. Make 15+ updates in a space → Triggers CRUNCH

Or wait for real activity patterns to emerge!

---

**Ready to deploy?** See main README.md for production deployment instructions.
