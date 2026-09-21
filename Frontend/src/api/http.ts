import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { BaseResponse, TokenResponse } from "@/types/api";
import { ErrorCode } from "@/types/api";
import { tokenStore } from "./tokenStore";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:10010";

export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const access = tokenStore.getAccessToken();
  if (access) config.headers.set("Access-Token", access);
  return config;
});

// 网关对未登录 / 令牌过期是在 HTTP 层直接返回 401（见 GateWay AuthorizeFilter），
// 而具体业务错误（密码错误等）走的是 HTTP 200 + BaseResponse.code。
// 这里统一处理：业务错误抛 ApiError；40103（令牌过期）尝试用 Refresh-Token 换新令牌后重试一次；
// 其它未登录场景清空本地会话并广播事件，交给 AuthContext 跳转登录页。

type QueueItem = { resolve: () => void; reject: (e: unknown) => void };
let refreshing = false;
let queue: QueueItem[] = [];

function broadcastUnauthorized() {
  tokenStore.clear();
  window.dispatchEvent(new CustomEvent("superchat:unauthorized"));
}

async function doRefresh(): Promise<void> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) {
    broadcastUnauthorized();
    throw new ApiError(ErrorCode.NOT_LOGIN_ERROR, "未登录");
  }
  const res = await axios.post<BaseResponse<TokenResponse>>(
    `${API_BASE_URL}/api/user/refresh`,
    null,
    { headers: { "Refresh-Token": refreshToken } },
  );
  const body = res.data;
  if (body.code !== ErrorCode.SUCCESS) {
    broadcastUnauthorized();
    throw new ApiError(body.code, body.message);
  }
  tokenStore.setTokens(body.data.accessToken, body.data.refreshToken);
}

http.interceptors.response.use(
  (res) => {
    const body = res.data as BaseResponse<unknown>;
    // 少数几个接口（get/receivers、get/sessions、get/nickname）直接返回原始数据，不套 BaseResponse
    if (body == null || typeof body !== "object" || !("code" in body)) {
      return res;
    }
    if (body.code !== ErrorCode.SUCCESS) {
      return Promise.reject(new ApiError(body.code, body.message || "请求失败"));
    }
    return res;
  },
  async (error: AxiosError<BaseResponse<unknown>>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;
    const bodyCode = error.response?.data?.code;

    const isRefreshCall = original?.url?.includes("/api/user/refresh");

    if (status === 401 && original && !original._retried && !isRefreshCall) {
      if (bodyCode === ErrorCode.TOKEN_EXPIRED) {
        original._retried = true;
        try {
          if (!refreshing) {
            refreshing = true;
            await doRefresh().finally(() => {
              refreshing = false;
              queue.forEach((q) => q.resolve());
              queue = [];
            });
          } else {
            await new Promise<void>((resolve, reject) => queue.push({ resolve, reject }));
          }
          const access = tokenStore.getAccessToken();
          if (access) original.headers.set("Access-Token", access);
          return http(original);
        } catch (e) {
          queue.forEach((q) => q.reject(e));
          queue = [];
          return Promise.reject(e);
        }
      }
      broadcastUnauthorized();
      return Promise.reject(
        new ApiError(bodyCode ?? ErrorCode.NOT_LOGIN_ERROR, error.response?.data?.message || "未登录"),
      );
    }

    if (error.response?.data && typeof error.response.data === "object" && "code" in error.response.data) {
      return Promise.reject(new ApiError(error.response.data.code, error.response.data.message || "请求失败"));
    }
    return Promise.reject(error);
  },
);

export default http;
