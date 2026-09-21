import http from "./http";
import type {
  BaseResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  GroupMemberVO,
  InviteGroupRequest,
  InviteGroupResponse,
} from "@/types/api";

export const groupApi = {
  async createGroup(payload: CreateGroupRequest): Promise<CreateGroupResponse> {
    const res = await http.post<BaseResponse<CreateGroupResponse>>("/api/group", payload);
    return res.data.data;
  },
  async inviteGroup(payload: InviteGroupRequest): Promise<InviteGroupResponse> {
    const res = await http.post<BaseResponse<InviteGroupResponse>>("/api/group/invite", payload);
    return res.data.data;
  },
  async getMembers(sessionId: string): Promise<GroupMemberVO[]> {
    const res = await http.get<BaseResponse<GroupMemberVO[]>>(`/api/group/${sessionId}/members`);
    return res.data.data;
  },
  async kickMember(sessionId: string, operatorId: string, targetId: string): Promise<boolean> {
    const res = await http.delete<BaseResponse<boolean>>(`/api/group/${sessionId}/member/${targetId}`, {
      params: { operatorId },
    });
    return res.data.data;
  },
  async leaveGroup(sessionId: string, userId: string): Promise<boolean> {
    const res = await http.post<BaseResponse<boolean>>(
      `/api/group/${sessionId}/leave`,
      null,
      { params: { userId } },
    );
    return res.data.data;
  },
};
