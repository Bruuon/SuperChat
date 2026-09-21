import http from "./http";
import type {
  BaseResponse,
  CreateGroupRequest,
  CreateGroupResponse,
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
};
