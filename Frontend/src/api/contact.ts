import http from "./http";
import type {
  AddFriendRequest,
  ApplyFriendDTO,
  BaseResponse,
  FriendDTO,
  FriendDetailVO,
  ModifyFriendApplicationRequest,
  ModifyFriendApplicationResponse,
  PageResponse,
} from "@/types/api";

export const contactApi = {
  async searchUser(userId: number, keyword: string): Promise<FriendDetailVO> {
    const res = await http.get<BaseResponse<FriendDetailVO>>(`/api/contact/${userId}/user/search`, {
      params: { keyword },
    });
    return res.data.data;
  },

  async getFriends(userId: number, key = "", pageNum = 1, pageSize = 100): Promise<PageResponse<FriendDTO>> {
    const res = await http.get<BaseResponse<PageResponse<FriendDTO>>>(`/api/contact/${userId}/friend`, {
      params: { key, pageNum, pageSize },
    });
    return res.data.data;
  },

  async sendFriendRequest(userId: number, receiveUserId: number, payload: AddFriendRequest): Promise<boolean> {
    const res = await http.post<BaseResponse<boolean>>(
      `/api/contact/${userId}/friend/${receiveUserId}`,
      payload,
    );
    return res.data.data;
  },

  async getApplyList(userId: number, pageNum = 1, pageSize = 50): Promise<PageResponse<ApplyFriendDTO>> {
    const res = await http.get<BaseResponse<PageResponse<ApplyFriendDTO>>>(`/api/contact/${userId}/apply`, {
      params: { pageNum, pageSize },
    });
    return res.data.data;
  },

  async getUnreadApplyCount(userId: number): Promise<number> {
    const res = await http.get<BaseResponse<{ count: number }>>(`/api/contact/${userId}/applyCount`);
    return res.data.data.count;
  },

  async deleteFriend(userId: number, friendId: number): Promise<boolean> {
    const res = await http.delete<BaseResponse<boolean>>(`/api/contact/${userId}/friend/${friendId}`);
    return res.data.data;
  },

  async blockFriend(userId: number, friendId: number): Promise<boolean> {
    const res = await http.post<BaseResponse<boolean>>(`/api/contact/${userId}/block/${friendId}`);
    return res.data.data;
  },

  async unblockFriend(userId: number, friendId: number): Promise<boolean> {
    const res = await http.delete<BaseResponse<boolean>>(`/api/contact/${userId}/block/${friendId}`);
    return res.data.data;
  },

  /** status: 1 通过 2 拒绝 3 已读 */
  async modifyApplicationStatus(
    userId: number,
    status: 1 | 2 | 3,
    payload: ModifyFriendApplicationRequest,
  ): Promise<ModifyFriendApplicationResponse | true> {
    const res = await http.post<BaseResponse<ModifyFriendApplicationResponse | true>>(
      `/api/contact/${userId}/application/${status}`,
      payload,
    );
    return res.data.data;
  },

  async getFriendDetail(userId: number, friendId: number): Promise<FriendDetailVO> {
    const res = await http.get<BaseResponse<FriendDetailVO>>(`/api/contact/${userId}/friend/${friendId}`);
    return res.data.data;
  },
};
