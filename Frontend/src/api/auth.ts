import http from "./http";
import type {
  BaseResponse,
  LoginAndRegisterResponse,
  UpdateAvatarRequest,
  UploadUrlResponse,
  UserLoginCodeRequest,
  UserLoginPasswordRequest,
  UserRegisterRequest,
} from "@/types/api";

export const authApi = {
  async sendCaptcha(targetEmail: string): Promise<string> {
    const res = await http.get<BaseResponse<string>>("/api/user/sendCaptcha", {
      params: { targetEmail },
    });
    return res.data.data;
  },

  async register(payload: UserRegisterRequest): Promise<LoginAndRegisterResponse> {
    const res = await http.post<BaseResponse<LoginAndRegisterResponse>>("/api/user/register", payload);
    return res.data.data;
  },

  async loginPassword(payload: UserLoginPasswordRequest): Promise<LoginAndRegisterResponse> {
    const res = await http.post<BaseResponse<LoginAndRegisterResponse>>(
      "/api/user/login/password",
      payload,
    );
    return res.data.data;
  },

  async loginCode(payload: UserLoginCodeRequest): Promise<LoginAndRegisterResponse> {
    const res = await http.post<BaseResponse<LoginAndRegisterResponse>>("/api/user/login/code", payload);
    return res.data.data;
  },

  async logout(): Promise<boolean> {
    const res = await http.get<BaseResponse<boolean>>("/api/user/logout");
    return res.data.data;
  },

  async refreshUri(userId: string): Promise<string | null> {
    const res = await http.get<BaseResponse<string>>("/api/user/refresh/uri", { params: { userId } });
    return res.data.data;
  },

  async getNicknames(sessionId: string): Promise<Record<string, string>> {
    // 该接口未套 BaseResponse，直接返回 Map<Long,String>
    const res = await http.get<Record<string, string>>("/api/user/get/nickname", {
      params: { sessionId },
    });
    return res.data;
  },

  /** 拿一个 MinIO 预签名 PUT 地址，用于直传头像原图 */
  async getUploadUrl(fileName: string): Promise<UploadUrlResponse> {
    const res = await http.get<BaseResponse<UploadUrlResponse>>("/api/user/uploadUrl", {
      params: { fileName },
    });
    return res.data.data;
  },

  async updateAvatar(payload: UpdateAvatarRequest): Promise<boolean> {
    const res = await http.post<BaseResponse<boolean>>("/api/user/update/avatar", payload);
    return res.data.data;
  },
};
