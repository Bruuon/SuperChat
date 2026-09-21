import http from "./http";

// UserSessionController：两个接口都没有套 BaseResponse，直接返回数组
export const sessionApi = {
  async getReceiversBySession(sessionId: number): Promise<number[]> {
    const res = await http.get<number[]>("/api/user/get/receivers", { params: { sessionId } });
    return res.data;
  },
  async getSessionIdsByUser(userId: number): Promise<number[]> {
    const res = await http.get<number[]>("/api/user/get/sessions", { params: { userId } });
    return res.data;
  },
};
