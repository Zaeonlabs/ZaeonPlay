/**
 * StreamPlugins API Client
 * Communicates with the local backend server at localhost:3847
 */

const SP_API_BASE = `http://localhost:${window.__SP_PORT || 3847}`;

const StreamPluginsAPI = {
  /**
   * Make a GET request to the backend.
   * @param {string} path - API path (e.g., '/api/metrics')
   * @returns {Promise<any>}
   */
  async get(path) {
    const res = await fetch(`${SP_API_BASE}${path}`);
    if (!res.ok) {
      throw new Error(`API GET ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Make a POST request to the backend.
   * @param {string} path - API path
   * @param {object} body - JSON body
   * @returns {Promise<any>}
   */
  async post(path, body) {
    const res = await fetch(`${SP_API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`API POST ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Make a PUT request to the backend.
   * @param {string} path - API path
   * @param {object} body - JSON body
   * @returns {Promise<any>}
   */
  async put(path, body) {
    const res = await fetch(`${SP_API_BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`API PUT ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Get authentication status for all platforms.
   * @returns {Promise<{twitch: boolean, youtube: boolean, kick: boolean}>}
   */
  async getAuthStatus() {
    return this.get('/auth/status');
  },

  /**
   * Get combined metrics from all connected platforms.
   * @returns {Promise<object>}
   */
  async getMetrics() {
    return this.get('/api/metrics');
  },

  /**
   * Update stream info on selected platforms.
   * @param {object} data - { platforms: string[], title?: string, category?: string, tags?: string[], description?: string }
   * @returns {Promise<object>}
   */
  async updateStreamInfo(data) {
    return this.post('/api/title/update', data);
  },

  /**
   * Search categories on a platform.
   * @param {string} platform - 'twitch', 'youtube', or 'kick'
   * @param {string} query - Search query
   * @returns {Promise<object[]>}
   */
  async searchCategories(platform, query) {
    return this.get(`/api/categories/${platform}?q=${encodeURIComponent(query)}`);
  },

  /**
   * Get current configuration.
   * @returns {Promise<object>}
   */
  async getConfig() {
    return this.get('/api/config');
  },

  /**
   * Update configuration.
   * @param {object} config - Partial config to merge
   * @returns {Promise<object>}
   */
  async updateConfig(config) {
    return this.put('/api/config', config);
  },
};
