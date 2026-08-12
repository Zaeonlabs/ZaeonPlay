/**
 * StreamPlugins WebSocket Client
 * Connects to the local backend WebSocket for real-time events.
 */

const SP_WS_URL = `ws://localhost:${window.__SP_PORT || 3847}/ws/events`;

class StreamPluginsWS {
  constructor() {
    this._ws = null;
    this._listeners = new Map();
    this._reconnectAttempts = 0;
    this._maxReconnectAttempts = 10;
    this._reconnectDelay = 1000;
    this._shouldReconnect = true;
  }

  /**
   * Connect to the WebSocket server.
   */
  connect() {
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      return;
    }

    this._ws = new WebSocket(SP_WS_URL);

    this._ws.onopen = () => {
      console.log('[StreamPlugins WS] Connected');
      this._reconnectAttempts = 0;
      this._emit('connected', {});
    };

    this._ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this._emit(data.type, data.payload);
      } catch (err) {
        console.error('[StreamPlugins WS] Failed to parse message:', err);
      }
    };

    this._ws.onclose = () => {
      console.log('[StreamPlugins WS] Disconnected');
      this._emit('disconnected', {});
      if (this._shouldReconnect) {
        this._scheduleReconnect();
      }
    };

    this._ws.onerror = (err) => {
      console.error('[StreamPlugins WS] Error:', err);
    };
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect() {
    this._shouldReconnect = false;
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }

  /**
   * Listen for a specific event type.
   * @param {string} eventType - Event type (e.g., 'chat', 'alert', 'metrics', 'connected', 'disconnected')
   * @param {function} callback - Handler function receiving the event payload
   * @returns {function} Unsubscribe function
   */
  on(eventType, callback) {
    if (!this._listeners.has(eventType)) {
      this._listeners.set(eventType, new Set());
    }
    this._listeners.get(eventType).add(callback);

    return () => {
      this._listeners.get(eventType)?.delete(callback);
    };
  }

  /**
   * @private
   */
  _emit(eventType, payload) {
    const handlers = this._listeners.get(eventType);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[StreamPlugins WS] Handler error for "${eventType}":`, err);
        }
      }
    }
  }

  /**
   * @private
   */
  _scheduleReconnect() {
    if (this._reconnectAttempts >= this._maxReconnectAttempts) {
      console.error('[StreamPlugins WS] Max reconnect attempts reached');
      return;
    }

    const delay = this._reconnectDelay * Math.pow(2, this._reconnectAttempts);
    this._reconnectAttempts++;

    console.log(`[StreamPlugins WS] Reconnecting in ${delay}ms (attempt ${this._reconnectAttempts})`);
    setTimeout(() => this.connect(), delay);
  }
}

const spWebSocket = new StreamPluginsWS();
