import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "@/api/auth";
import { tokenStore, type StoredUser } from "@/api/tokenStore";
import type {
  LoginAndRegisterResponse,
  UserLoginCodeRequest,
  UserLoginPasswordRequest,
  UserRegisterRequest,
} from "@/types/api";
import { realtimeSocket } from "@/ws/socket";

interface AuthContextValue {
  user: StoredUser | null;
  ready: boolean;
  loginPassword: (payload: UserLoginPasswordRequest) => Promise<void>;
  loginCode: (payload: UserLoginCodeRequest) => Promise<void>;
  register: (payload: UserRegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<StoredUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toStoredUser(res: LoginAndRegisterResponse): StoredUser {
  return {
    userId: res.userId,
    email: res.email,
    nickname: res.nickname,
    avatar: res.avatar,
    nettyUri: res.nettyUri,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() => tokenStore.getUser());
  const [ready, setReady] = useState(false);

  const connectRealtime = useCallback((u: StoredUser) => {
    const access = tokenStore.getAccessToken();
    if (u.nettyUri && access) {
      realtimeSocket.connect(u.nettyUri, access);
    }
  }, []);

  useEffect(() => {
    setReady(true);
    if (user) connectRealtime(user);

    const onUnauthorized = () => {
      realtimeSocket.disconnect();
      setUser(null);
    };
    window.addEventListener("superchat:unauthorized", onUnauthorized);
    return () => window.removeEventListener("superchat:unauthorized", onUnauthorized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySession = useCallback(
    (res: LoginAndRegisterResponse) => {
      const stored = toStoredUser(res);
      tokenStore.setSession(res.accessToken, res.refreshToken, stored);
      setUser(stored);
      connectRealtime(stored);
    },
    [connectRealtime],
  );

  const loginPassword = useCallback(
    async (payload: UserLoginPasswordRequest) => {
      const res = await authApi.loginPassword(payload);
      applySession(res);
    },
    [applySession],
  );

  const loginCode = useCallback(
    async (payload: UserLoginCodeRequest) => {
      const res = await authApi.loginCode(payload);
      applySession(res);
    },
    [applySession],
  );

  const register = useCallback(
    async (payload: UserRegisterRequest) => {
      const res = await authApi.register(payload);
      applySession(res);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 即使接口失败也要清本地状态，避免用户被卡在已登出但界面还在的状态
    }
    realtimeSocket.disconnect();
    tokenStore.clear();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<StoredUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      tokenStore.setUser(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, ready, loginPassword, loginCode, register, logout, updateUser }),
    [user, ready, loginPassword, loginCode, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 必须在 AuthProvider 内使用");
  return ctx;
}
