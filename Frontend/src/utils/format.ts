// 头像底色：按用户 ID 稳定映射到莫兰迪调色板里的一个色号，
// 保证同一个人在任何地方头像颜色都一致。
const AVATAR_TOKENS = ["--av-1", "--av-2", "--av-3", "--av-4", "--av-5", "--av-6"];

export function avatarStyle(id: number | string): React.CSSProperties {
  const n = typeof id === "number" ? id : hashString(id);
  const token = AVATAR_TOKENS[Math.abs(n) % AVATAR_TOKENS.length];
  return { "--av": `var(${token})` } as React.CSSProperties;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export function initials(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed[0] : "?";
}

export function formatAmount(v: number | null | undefined): string {
  if (v == null) return "0.00";
  return v.toFixed(2);
}

/** 后端 createdTime 形如 "yyyy-MM-dd HH:mm:ss"，这里只取时:分展示在会话/消息里 */
export function formatClock(createdTime: string | undefined): string {
  if (!createdTime) return "";
  const m = createdTime.match(/(\d{2}):(\d{2})(:\d{2})?$/);
  return m ? `${m[1]}:${m[2]}` : createdTime;
}

export function formatRelative(createdTime: string | undefined): string {
  if (!createdTime) return "";
  const normalized = createdTime.replace(" ", "T");
  const t = new Date(normalized).getTime();
  if (Number.isNaN(t)) return createdTime;
  const diffMin = Math.round((Date.now() - t) / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}小时`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay === 1) return "昨天";
  if (diffDay < 7) return `${diffDay}天`;
  return createdTime.slice(5, 10).replace("-", "/");
}
