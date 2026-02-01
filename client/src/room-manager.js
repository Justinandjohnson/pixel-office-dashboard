import * as PIXI from 'pixi.js';
import { DEPARTMENTS, ROOM_LAYOUT, DEPARTMENT_THEMES } from '../../shared/department-config.js';
import { STATE_VISUALS } from '../../shared/state-definitions.js';

export class RoomManager {
  constructor(app) {
    this.app = app;
    this.rooms = new Map();
    this.building = new PIXI.Container();
    this.app.stage.addChild(this.building);
  }

  async init() {
    DEPARTMENTS.forEach((dept, index) => {
      const room = this.createRoom(dept);
      this.rooms.set(dept.code, room);
      this.building.addChild(room.container);
    });
  }

  createRoom(dept) {
    const floor = ROOM_LAYOUT.floors.find(f => f.departments.includes(dept.code));
    const floorIndex = ROOM_LAYOUT.floors.indexOf(floor);
    const positionInFloor = floor.departments.indexOf(dept.code);

    const x = positionInFloor * ROOM_LAYOUT.width;
    const y = floorIndex * ROOM_LAYOUT.height;

    const container = new PIXI.Container();
    container.x = x;
    container.y = y;

    const background = new PIXI.Graphics();
    background.beginFill(parseInt(dept.color.replace('#', '0x')));
    background.drawRect(0, 0, ROOM_LAYOUT.width, ROOM_LAYOUT.height);
    background.endFill();
    background.alpha = 0.15;
    container.addChild(background);

    const border = new PIXI.Graphics();
    border.lineStyle(2, 0x444444);
    border.drawRect(0, 0, ROOM_LAYOUT.width, ROOM_LAYOUT.height);
    container.addChild(border);

    const nameText = new PIXI.Text(dept.name, {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xffffff,
      align: 'center'
    });
    nameText.x = ROOM_LAYOUT.width / 2 - nameText.width / 2;
    nameText.y = 10;
    container.addChild(nameText);

    const stateText = new PIXI.Text('Idle', {
      fontFamily: 'Arial',
      fontSize: 12,
      fill: 0x888888,
      align: 'center'
    });
    stateText.x = ROOM_LAYOUT.width / 2 - stateText.width / 2;
    stateText.y = 30;
    container.addChild(stateText);

    const charactersContainer = new PIXI.Container();
    charactersContainer.x = ROOM_LAYOUT.width / 2;
    charactersContainer.y = ROOM_LAYOUT.height / 2;
    container.addChild(charactersContainer);

    const lightingOverlay = new PIXI.Graphics();
    lightingOverlay.beginFill(0xFFFFFF);
    lightingOverlay.drawRect(0, 0, ROOM_LAYOUT.width, ROOM_LAYOUT.height);
    lightingOverlay.endFill();
    lightingOverlay.alpha = 0;
    lightingOverlay.blendMode = PIXI.BLEND_MODES.ADD;
    container.addChild(lightingOverlay);

    return {
      container,
      dept,
      background,
      border,
      nameText,
      stateText,
      charactersContainer,
      lightingOverlay,
      currentState: 'idle',
      characterCount: 0,
      characters: [],
      animationPhase: 0
    };
  }

  updateRoom(spaceCode, newState, characterCount, metadata) {
    const room = this.rooms.get(spaceCode);
    if (!room) return;

    if (room.currentState !== newState) {
      this.transitionRoomState(room, newState);
    }

    if (room.characterCount !== characterCount) {
      this.updateCharacterCount(room, characterCount);
    }

    room.stateText.text = newState.toUpperCase();
    room.stateText.x = ROOM_LAYOUT.width / 2 - room.stateText.width / 2;
  }

  transitionRoomState(room, newState) {
    room.currentState = newState;

    const visuals = STATE_VISUALS[newState];
    if (!visuals) return;

    const targetColor = visuals.lighting.color;
    const targetAlpha = visuals.lighting.intensity * 0.3;

    this.animateLightingTransition(room.lightingOverlay, targetColor, targetAlpha);

    room.stateText.style.fill = this.getStateColor(newState);
  }

  animateLightingTransition(lightingOverlay, targetColor, targetAlpha) {
    const startAlpha = lightingOverlay.alpha;
    const duration = 60;
    let elapsed = 0;

    const animate = () => {
      elapsed++;
      const progress = Math.min(elapsed / duration, 1);
      
      lightingOverlay.alpha = startAlpha + (targetAlpha - startAlpha) * progress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  getStateColor(state) {
    const colors = {
      'blocked': 0xFF0000,
      'shipping': 0x10b981,
      'crunch': 0xf59e0b,
      'active': 0x3b82f6,
      'planning': 0x8b5cf6,
      'idle': 0x6b7280,
      'off-hours': 0x374151
    };
    return colors[state] || 0x888888;
  }

  updateCharacterCount(room, count) {
    while (room.characters.length < count) {
      this.addCharacter(room);
    }

    while (room.characters.length > count) {
      this.removeCharacter(room);
    }

    room.characterCount = count;
  }

  addCharacter(room) {
    // Load a random character sprite
    const spriteIndex = Math.floor(Math.random() * 132); // 132 character sprites available
    const spritePath = `/sprites/characters/tile_${spriteIndex.toString().padStart(4, '0')}.png`;

    console.log(`Adding character to ${room.dept.name}: ${spritePath}`);

    const texture = PIXI.Texture.from(spritePath);
    const character = new PIXI.Sprite(texture);

    // Scale the sprite (pixel art sprites are typically small)
    character.scale.set(2, 2);
    character.anchor.set(0.5, 0.5);

    const angle = (room.characters.length / (room.characterCount + 1)) * Math.PI * 2;
    const radius = 40;
    character.x = Math.cos(angle) * radius;
    character.y = Math.sin(angle) * radius;

    room.charactersContainer.addChild(character);
    room.characters.push(character);
  }

  removeCharacter(room) {
    const character = room.characters.pop();
    if (character) {
      room.charactersContainer.removeChild(character);
    }
  }

  update(delta) {
    this.rooms.forEach(room => {
      room.animationPhase += delta * 0.05;

      room.characters.forEach((char, i) => {
        const bobAmount = Math.sin(room.animationPhase + i) * 2;
        char.y += bobAmount * 0.1;
      });

      if (room.currentState === 'blocked') {
        const pulse = (Math.sin(room.animationPhase * 0.5) + 1) * 0.15;
        room.lightingOverlay.alpha = pulse;
      }
    });
  }
}
