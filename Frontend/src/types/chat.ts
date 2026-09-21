import type { MessageResponse } from "./api";

export interface Conversation {
  sessionId: string;
  sessionType: number; // 0 单聊 1 群聊 2 AI
  name: string;
  avatar?: string | null;
  peerId?: string; // 单聊时对方的 userId，红包接收者等场景需要
  lastMessage?: MessageResponse;
  unread: number;
}
