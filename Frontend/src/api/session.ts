import http from "./http";
import type { BaseResponse, SessionSummary } from "@/types/api";

export const sessionApi = {
  // 这两个接口没有套 BaseResponse，直接返回数组
  async getReceiversBySession(sessionId: string): Promise<string[]> {
    const res = await http.get<string[]>("/api/user/get/receivers", { params: { sessionId } });
    return res.data;
  },
  async getSessionIdsByUser(userId: string): Promise<string[]> {
    const res = await http.get<string[]>("/api/user/get/sessions", { params: { userId } });
    return res.data;
  },

  /** 当前用户加入的所有会话详情（单聊/群聊/AI），用于搭会话列表、找 AI 助手会话 */
  async getMySessions(userId: string): Promise<SessionSummary[]> {
    const res = await http.get<BaseResponse<SessionSummary[]>>("/api/user/get/mySessions", {
      params: { userId },
    });
    return res.data.data;
  },
};
