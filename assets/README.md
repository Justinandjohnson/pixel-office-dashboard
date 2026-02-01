# Pixel Art Assets

This folder will contain your pixel art sprites and visual assets.

## Required Assets

### Characters (32x32 recommended)
- `sprites/characters/idle.png` - Standing/waiting animation
- `sprites/characters/typing.png` - Working at desk animation
- `sprites/characters/celebrating.png` - Success/shipping animation
- `sprites/characters/frustrated.png` - Blocked/stressed animation

### Furniture (various sizes)
- `furniture/desk.png` - Desk with computer (64x32)
- `furniture/chair.png` - Office chair (32x32)
- `furniture/monitor.png` - Computer monitor (32x24)

### Effects
- `effects/confetti.png` - Celebration particles (8x8 each)
- `effects/alert-light.png` - Warning indicator (16x16)
- `effects/sparkle.png` - Activity indicators (8x8)

### Rooms
- `rooms/floor-tile.png` - Background pattern
- `rooms/wall.png` - Wall sections
- `rooms/window.png` - Window decorations

### UI
- `ui/tooltip-bg.png` - Tooltip backgrounds
- `ui/status-icons.png` - State indicator icons

## Asset Sources

### Free Options:
1. **Kenney.nl** (Recommended)
   - https://kenney.nl/assets
   - CC0 license (public domain)
   - Download "Tiny Town" and "UI Pack"

2. **OpenGameArt.org**
   - Search "office" or "pixel art characters"
   - Various licenses (check each)

3. **itch.io**
   - https://itch.io/game-assets/free/tag-pixel-art
   - Many free assets with attribution

### Paid Option:
- **Aseprite** ($19.99)
  - Create custom branded sprites
  - Export as sprite sheets
  - Full animation control

## Integration

Once you have assets, update the sprite paths in:
- `client/src/room-manager.js`
- Add sprite loading in `client/src/main.js`

Example:
```javascript
await PIXI.Assets.load('/assets/sprites/characters/idle.png');
const texture = PIXI.Texture.from('idle.png');
```

## Placeholder

For now, the dashboard uses simple colored circles as character placeholders.
Replace with actual sprites when ready!
