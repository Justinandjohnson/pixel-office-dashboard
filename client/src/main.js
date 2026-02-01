import * as PIXI from 'pixi.js';
import { RoomManager } from './room-manager.js';
import { WebSocketClient } from './websocket-client.js';
import { CANVAS_CONFIG } from '../../shared/department-config.js';

class PixelOfficeDashboard {
  constructor() {
    this.app = null;
    this.roomManager = null;
    this.wsClient = null;
  }

  async init() {
    this.createPixiApp();
    this.roomManager = new RoomManager(this.app);
    await this.roomManager.init();
    
    this.wsClient = new WebSocketClient(this.handleUpdate.bind(this));
    this.wsClient.connect();
    
    this.hideLoading();
  }

  createPixiApp() {
    this.app = new PIXI.Application({
      width: CANVAS_CONFIG.width,
      height: CANVAS_CONFIG.height,
      backgroundColor: CANVAS_CONFIG.backgroundColor,
      antialias: false
    });

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    const container = document.getElementById('canvas-container');
    container.appendChild(this.app.view);

    this.app.ticker.add((delta) => {
      if (this.roomManager) {
        this.roomManager.update(delta);
      }
    });
  }

  handleUpdate(data) {
    if (data.type === 'update' && data.departments) {
      data.departments.forEach(dept => {
        this.roomManager.updateRoom(dept.space, dept.state, dept.characterCount, dept.metadata);
      });
    }
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
    }
  }
}

const dashboard = new PixelOfficeDashboard();
dashboard.init();
