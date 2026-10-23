import { DashboardResponse } from '@/types/water-monitoring';

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export class DashboardWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 2000;
  private maxReconnectDelay = 30000;
  private shouldReconnect = true;

  constructor(
    private onMessage: (data: DashboardResponse) => void,
    private onStatusChange: (connected: boolean) => void
  ) {}

  public connect(): void {
    if (typeof window === 'undefined') return;

    this.shouldReconnect = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    try {
      const url = `${WS_BASE.replace(/\/+$/, '')}/api/v1/ws/dashboard`;
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectDelay = 2000;
        this.onStatusChange(true);
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          if (payload && payload.summary && Array.isArray(payload.tanks)) {
            this.onMessage(payload as DashboardResponse);
          }
        } catch {
          // Ignore invalid message frames
        }
      };

      this.ws.onerror = () => {
        this.onStatusChange(false);
      };

      this.ws.onclose = () => {
        this.onStatusChange(false);
        this.ws = null;
        if (this.shouldReconnect) {
          this.scheduleReconnect();
        }
      };
    } catch {
      this.onStatusChange(false);
      if (this.shouldReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.onStatusChange(false);
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, this.maxReconnectDelay);
    }, this.reconnectDelay);
  }
}
