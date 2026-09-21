import http from "./http";
import type {
  BaseResponse,
  ReceiveResultVO,
  RedPacketBasicVO,
  RedPacketDetailVO,
  RedPacketReceiveRequest,
  RedPacketSendRequest,
  RedPacketSendVO,
} from "@/types/api";

export const redPacketApi = {
  async send(payload: RedPacketSendRequest): Promise<RedPacketSendVO> {
    const res = await http.post<BaseResponse<RedPacketSendVO>>("/api/chat/redPacket/send", payload);
    return res.data.data;
  },
  async receive(payload: RedPacketReceiveRequest): Promise<ReceiveResultVO> {
    const res = await http.post<BaseResponse<ReceiveResultVO>>("/api/chat/redPacket/receive", payload);
    return res.data.data;
  },
  async getDetail(redPacketId: string, pageNum = 1, pageSize = 20): Promise<RedPacketDetailVO> {
    const res = await http.get<BaseResponse<RedPacketDetailVO>>("/api/chat/redPacket/", {
      params: { redPacketId, pageNum, pageSize },
    });
    return res.data.data;
  },
  async getBasic(redPacketId: string): Promise<RedPacketBasicVO> {
    const res = await http.get<BaseResponse<RedPacketBasicVO>>("/api/chat/redPacket/basic", {
      params: { redPacketId },
    });
    return res.data.data;
  },
};
