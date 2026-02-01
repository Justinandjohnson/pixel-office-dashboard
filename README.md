# 🏢 Pixel Office Dashboard

Real-time pixel art office visualization powered by your Atlassian (Jira + Confluence) data.

Watch your team's activity come to life in a 10-room office building, where each department's room changes based on actual work patterns:
- 🔴 War rooms & blockers trigger red alerts
- 🎉 Releases & deployments trigger celebrations  
- 💨 Crunch mode shows fast-paced activity
- 😴 Idle teams have dim lights
- 🌙 Off-hours rooms are dark

## Tech Stack

- **Frontend:** PixiJS (WebGL rendering), Vite
- **Backend:** Node.js, WebSocket (ws)
- **Data:** Atlassian MCP (Confluence + Jira)
- **Real-time:** WebSocket push updates

## Quick Start

### Prerequisites

- Node.js 18+
- Access to Atlassian Confluence/Jira
- API token for Atlassian

### Installation

```bash
cd pixel-office-dashboard
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Edit `.env` with your Atlassian credentials:
```env
CONFLUENCE_URL=https://your-domain.atlassian.net/wiki
CONFLUENCE_USERNAME=your-email@company.com
CONFLUENCE_API_TOKEN=your-api-token-here
```

### Running

Start both server and client:
```bash
npm run dev
```

Or run separately:
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run client
```

Open http://localhost:5173 in your browser.

## Project Structure

```
pixel-office-dashboard/
├── server/               # Backend WebSocket server
│   └── src/
│       ├── index.js               # Main server
│       ├── atlassian-client.js    # MCP integration
│       └── state-analyzer.js      # Activity → state logic
├── client/               # Frontend PixiJS app
│   ├── index.html
│   └── src/
│       ├── main.js                # App initialization
│       ├── room-manager.js        # Room rendering
│       └── websocket-client.js    # Real-time connection
├── shared/               # Shared configs
│   ├── department-config.js       # Room layouts
│   └── state-definitions.js       # State mappings
└── assets/               # Pixel art sprites (you add these)
    ├── sprites/
    ├── furniture/
    └── effects/
```

## Room States

The dashboard automatically determines room states based on activity:

| State | Trigger | Visual |
|-------|---------|--------|
| **BLOCKED** | War room keywords, 2+ blocked issues | Red pulsing alert |
| **SHIPPING** | Release keywords, 5+ completions today | Green celebration confetti |
| **CRUNCH** | 15+ updates/week, high-priority work | Fast animations, bright lights |
| **ACTIVE** | 3+ in-progress issues, 5+ updates/week | Normal office activity |
| **PLANNING** | PRD/design keywords, high backlog | Whiteboard meetings |
| **IDLE** | 1-4 updates/week, low activity | Dim lights, minimal motion |
| **OFF-HOURS** | 0 updates, outside work hours | Dark, empty room |

## Departments

10 rooms across 2 floors:

**Floor 2:** Engineering, QA, Advertising, Eng Platform, Product Management  
**Floor 1:** Operations, Data Warehouse, IT Support, Marketing, Office Management

Edit `shared/department-config.js` to customize your departments.

## Adding Pixel Art Assets

Currently using placeholder graphics. To add real sprites:

1. **Get assets** from Kenney.nl (free CC0) or create with Aseprite
2. **Add to** `assets/sprites/`, `assets/furniture/`, etc.
3. **Update** sprite loading in `client/src/room-manager.js`

See `assets/README.md` for details.

## Polling Strategy

Backend uses tiered polling to save API calls:

- **High activity** (Eng, QA, PM): 30 seconds
- **Medium activity** (ADS, MKT, IT): 60 seconds  
- **Low activity** (Ops, EP, DW, OM): 2 minutes

Configure in `shared/state-definitions.js`.

## Development

### Build for Production

```bash
npm run build
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CONFLUENCE_URL` | Your Confluence base URL | - |
| `CONFLUENCE_USERNAME` | Atlassian account email | - |
| `CONFLUENCE_API_TOKEN` | API token (from Atlassian) | - |
| `WEBSOCKET_PORT` | Backend WebSocket port | 8080 |
| `VITE_WS_URL` | Frontend WebSocket URL | ws://localhost:8080 |

## Deployment

### Backend (Railway/Render)

1. Create new Node.js service
2. Set environment variables
3. Deploy from `server/` directory
4. Use start command: `node server/src/index.js`

### Frontend (Vercel/Netlify)

1. Create new site from Git
2. Build command: `vite build`
3. Output directory: `dist`
4. Set `VITE_WS_URL` to your backend URL

## Troubleshooting

**WebSocket won't connect:**
- Check backend is running on port 8080
- Verify `VITE_WS_URL` matches backend URL
- Check firewall/CORS settings

**No data showing:**
- Verify Atlassian credentials in `.env`
- Check browser console for errors
- Confirm MCP connection in server logs

**Rooms not updating:**
- Check network tab for WebSocket messages
- Verify department codes match your Confluence spaces
- Review server logs for polling errors

## License

MIT

## Credits

- Inspired by [PixelHQ](https://www.reddit.com/r/ClaudeCode/comments/1qrbsfa/i_built_a_pixel_office_that_animates_in_realtime/)
- Built with PixiJS, Atlassian MCP, and Claude Code
