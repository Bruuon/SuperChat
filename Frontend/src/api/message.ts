import http from "./http";
import type {
  BaseResponse,
  HistoryMessageRequest,
  MessageResponse,
  OfflineMessageRequest,
} from "@/types/api";

export const messageApi = {
  async getOfflineMessages(payload: OfflineMessageRequest): Promise<Record<number, MessageResponse[]>> {
    const res = await http.post<BaseResponse<Record<number, MessageResponse[]>>>(
      "/api/message/offline",
      payload,
    );
    return res.data.data;
  },

  async getHistoryMessages(payload: HistoryMessageRequest): Promise<MessageResponse[]> {
    const res = await http.post<BaseResponse<MessageResponse[]>>("/api/message/history", payload);
    return res.data.data;
  },

  async getSessionSummary(sessionId: string, hours: number): Promise<string> {
    const res = await http.post<BaseResponse<string>>("/api/message/summary", { sessionId, hours });
    return res.data.data;
  },
};
