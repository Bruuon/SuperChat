// 令牌与登录用户信息的本地存储封装。
// 之所以单独抽出来，是因为 http.ts（axios 拦截器）和
// AuthContext 都需要读写同一份令牌，避免循环依赖。

const ACCESS_KEY = "superchat.accessToken";
const REFRESH_KEY = "superchat.refreshToken";
const USER_KEY = "superchat.user";

export interface StoredUser {
  /** 雪花算法生成的 19 位 Long，精度超出 JS number，这里一律按字符串处理 */
  userId: string;
  email: string;
  nickname: string;
  avatar: string | null;
  nettyUri: string | null;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 隐私模式等场景下静默忽略 */
  }
}
function safeRemove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export const tokenStore = {
  getAccessToken: () => safeGet(ACCESS_KEY),
  getRefreshToken: () => safeGet(REFRESH_KEY),
  getUser(): StoredUser | null {
    const raw = safeGet(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredUser;
    } catch {
      return null;
    }
  },
  setSession(accessToken: string, refreshToken: string, user: StoredUser) {
    safeSet(ACCESS_KEY, accessToken);
    safeSet(REFRESH_KEY, refreshToken);
    safeSet(USER_KEY, JSON.stringify(user));
  },
  setTokens(accessToken: string, refreshToken: string) {
    safeSet(ACCESS_KEY, accessToken);
    safeSet(REFRESH_KEY, refreshToken);
  },
  setUser(user: StoredUser) {
    safeSet(USER_KEY, JSON.stringify(user));
  },
  clear() {
    safeRemove(ACCESS_KEY);
    safeRemove(REFRESH_KEY);
    safeRemove(USER_KEY);
  },
};
