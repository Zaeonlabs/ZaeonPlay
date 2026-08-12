/**
 * OBS WebSocket v5 Client
 *
 * Connects to OBS Studio's obs-websocket server (default ws://localhost:4455)
 * to discover scenes/sources and execute actions in response to stream events.
 *
 * Uses the obs-websocket-js library (v5+).
 */

// import OBSWebSocket from 'obs-websocket-js';
// The actual import is deferred to runtime; this file provides the
// integration scaffold for when the obs-websocket-js package is installed.

interface OBSConnectionOptions {
  host?: string;
  port?: number;
  password?: string;
}

interface ReactionRule {
  trigger: string;
  action: string;
  target: string;
  duration?: number;
  revertScene?: string;
  minAmount?: number;
  enabled?: boolean;
}

type EventEmitFn = (event: string, data: unknown) => void;

export class OBSWebSocketClient {
  private obs: any = null;
  private connected = false;
  private scenes: string[] = [];
  private sources: string[] = [];
  private rules: ReactionRule[] = [];
  private emit: EventEmitFn;

  constructor(emit: EventEmitFn) {
    this.emit = emit;
  }

  async connect(opts: OBSConnectionOptions = {}): Promise<{
    connected: boolean;
    scenes: string[];
    sources: string[];
  }> {
    try {
      // Dynamic import so the server doesn't hard-fail if the package isn't installed
      const { default: OBSWebSocket } = await import('obs-websocket-js');
      this.obs = new OBSWebSocket();

      const url = `ws://${opts.host || 'localhost'}:${opts.port || 4455}`;
      await this.obs.connect(url, opts.password || undefined);
      this.connected = true;

      await this.refreshScenes();
      await this.refreshSources();

      console.log('[OBS] Connected to', url);
      return { connected: true, scenes: this.scenes, sources: this.sources };
    } catch (err) {
      console.error('[OBS] Connection failed:', err);
      this.connected = false;
      throw err;
    }
  }

  async disconnect(): Promise<void> {
    if (this.obs) {
      await this.obs.disconnect();
      this.connected = false;
      this.obs = null;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  getStatus() {
    return {
      connected: this.connected,
      scenes: this.scenes,
      sources: this.sources,
    };
  }

  setRules(rules: ReactionRule[]): void {
    this.rules = rules;
  }

  private async refreshScenes(): Promise<void> {
    if (!this.obs) return;
    try {
      const { scenes } = await this.obs.call('GetSceneList');
      this.scenes = (scenes as any[]).map((s: any) => s.sceneName);
    } catch (err) {
      console.error('[OBS] Failed to get scenes:', err);
    }
  }

  private async refreshSources(): Promise<void> {
    if (!this.obs) return;
    try {
      const { inputs } = await this.obs.call('GetInputList');
      this.sources = (inputs as any[]).map((s: any) => s.inputName);
    } catch (err) {
      console.error('[OBS] Failed to get sources:', err);
    }
  }

  /**
   * Execute a single reaction rule against OBS.
   */
  async executeRule(rule: ReactionRule): Promise<void> {
    if (!this.obs || !this.connected) throw new Error('OBS not connected');

    switch (rule.action) {
      case 'switch_scene': {
        const currentScene = (await this.obs.call('GetCurrentProgramScene')).currentProgramSceneName;
        await this.obs.call('SetCurrentProgramScene', { sceneName: rule.target });
        if (rule.revertScene && rule.duration) {
          setTimeout(async () => {
            try {
              await this.obs.call('SetCurrentProgramScene', {
                sceneName: rule.revertScene || currentScene,
              });
            } catch (_) {}
          }, (rule.duration ?? 5) * 1000);
        }
        break;
      }
      case 'show_source': {
        await this.setSourceVisible(rule.target, true, rule.duration);
        break;
      }
      case 'hide_source': {
        await this.setSourceVisible(rule.target, false);
        break;
      }
      case 'play_media': {
        await this.obs.call('TriggerMediaInputAction', {
          inputName: rule.target,
          mediaAction: 'OBS_WEBSOCKET_MEDIA_INPUT_ACTION_RESTART',
        });
        break;
      }
      default:
        console.warn('[OBS] Unknown action:', rule.action);
    }
  }

  private async setSourceVisible(name: string, visible: boolean, autoHideSec?: number): Promise<void> {
    const { currentProgramSceneName } = await this.obs.call('GetCurrentProgramScene');
    const { sceneItemId } = await this.obs.call('GetSceneItemId', {
      sceneName: currentProgramSceneName,
      sourceName: name,
    });
    await this.obs.call('SetSceneItemEnabled', {
      sceneName: currentProgramSceneName,
      sceneItemId,
      sceneItemEnabled: visible,
    });
    if (visible && autoHideSec) {
      setTimeout(async () => {
        try {
          await this.obs.call('SetSceneItemEnabled', {
            sceneName: currentProgramSceneName,
            sceneItemId,
            sceneItemEnabled: false,
          });
        } catch (_) {}
      }, autoHideSec * 1000);
    }
  }

  /**
   * Called by the event system when a stream event occurs.
   * Matches against enabled rules and executes them.
   */
  async handleStreamEvent(eventType: string, data: any): Promise<void> {
    if (!this.connected) return;

    for (const rule of this.rules) {
      if (!rule.enabled) continue;
      if (rule.trigger !== eventType) continue;
      if (rule.minAmount && (data.amount ?? 0) < rule.minAmount) continue;

      try {
        await this.executeRule(rule);
      } catch (err) {
        console.error(`[OBS] Rule execution failed for ${eventType}:`, err);
      }
    }
  }
}
