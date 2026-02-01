const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
const RECONNECT_DELAY = 3000;

export class WebSocketClient {
  constructor(onMessage) {
    this.ws = null;
    this.onMessage = onMessage;
    this.reconnectTimer = null;
    this.statusEl = document.getElementById('status');
  }

  connect() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('✅ Connected to server');
        this.updateStatus('connected', 'Connected');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.onMessage(data);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from server');
        this.updateStatus('disconnected', 'Disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.updateStatus('disconnected', 'Connection error');
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.updateStatus('disconnected', 'Failed to connect');
      this.scheduleReconnect();
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = setTimeout(() => {
      console.log('🔄 Attempting to reconnect...');
      this.connect();
    }, RECONNECT_DELAY);
  }

  updateStatus(state, text) {
    if (!this.statusEl) return;
    
    this.statusEl.className = state;
    this.statusEl.textContent = text;
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
