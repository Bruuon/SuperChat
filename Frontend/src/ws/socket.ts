import type { MessageRequest, MessageResponse } from "@/types/api";
import { parseBigJson } from "@/utils/bigJson";

// RealTimeService 的 Netty WebSocket 不经过网关，直接连到
// 登录时下发的 nettyUri（形如 "10.68.48.172:9101/ws/netty"）。
// 浏览器原生 WebSocket 无法自定义握手头，鉴权令牌走 ?token= 查询参数
//（RealTimeService.WebSocketAuthHeader 已相应支持）。

const HEARTBEAT_PING = "ping";
const HEARTBEAT_PONG = "pong";
const HEARTBEAT_INTERVAL_MS = 25_000;
const RECONNECT_BASE_MS = 1500;
const RECONNECT_MAX_MS = 20_000;

export type SocketStatus = "idle" | "connecting" | "open" | "closed";

type MessageListener = (msg: MessageResponse) => void;
type StatusListener = (status: SocketStatus) => void;

class RealtimeSocket {
  private ws: WebSocket | null = null;
  private nettyUri: string | null = null;
  private token: string | null = null;
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private manuallyClosed = false;
  private status: SocketStatus = "idle";

  private messageListeners = new Set<MessageListener>();
  private statusListeners = new Set<StatusListener>();
  private sendQueue: MessageRequest[] = [];

  connect(nettyUri: string, token: string) {
    this.nettyUri = nettyUri;
    this.token = token;
    this.manuallyClosed = false;
    this.reconnectAttempt = 0;
    this.open();
  }

  disconnect() {
    this.manuallyClosed = true;
    this.clearTimers();
    this.ws?.close();
    this.ws = null;
    this.setStatus("closed");
  }

  onMessage(listener: MessageListener) {
    this.messageListeners.add(listener);
    return () => { this.messageListeners.delete(listener); };
  }

  onStatusChange(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => { this.statusListeners.delete(listener); };
  }

  send(payload: MessageRequest) {
    const text = JSON.stringify(payload);
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(text);
    } else {
      // 断线时先排队，重连成功后补发
      this.sendQueue.push(payload);
    }
  }

  private open() {
    if (!this.nettyUri || !this.token) return;
    this.setStatus("connecting");
    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `${scheme}://${this.nettyUri}?token=${encodeURIComponent(this.token)}`;
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.setStatus("open");
      this.startHeartbeat();
      const pending = this.sendQueue;
      this.sendQueue = [];
      pending.forEach((m) => this.send(m));
    };

    ws.onmessage = (evt) => {
      const data = String(evt.data);
      if (data === HEARTBEAT_PONG) return;
      try {
        const parsed = parseBigJson<MessageResponse>(data);
        this.messageListeners.forEach((l) => l(parsed));
      } catch {
        // 非 JSON、非心跳的意外帧，忽略
      }
    };

    ws.onclose = () => {
      this.clearHeartbeat();
      this.setStatus("closed");
      if (!this.manuallyClosed) this.scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  private scheduleReconnect() {
    this.clearReconnect();
    const delay = Math.min(RECONNECT_BASE_MS * 2 ** this.reconnectAttempt, RECONNECT_MAX_MS);
    this.reconnectAttempt += 1;
    this.reconnectTimer = window.setTimeout(() => this.open(), delay);
  }

  private startHeartbeat() {
    this.clearHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(HEARTBEAT_PING);
    }, HEARTBEAT_INTERVAL_MS);
  }

  private clearHeartbeat() {
    if (this.heartbeatTimer !== null) window.clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }
  private clearReconnect() {
    if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }
  private clearTimers() {
    this.clearHeartbeat();
    this.clearReconnect();
  }

  private setStatus(status: SocketStatus) {
    this.status = status;
    this.statusListeners.forEach((l) => l(status));
  }

  getStatus() {
    return this.status;
  }
}

export const realtimeSocket = new RealtimeSocket();
