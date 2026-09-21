import { avatarStyle, initials } from "@/utils/format";

interface AvatarProps {
  id: number | string;
  name: string;
  src?: string | null;
  size?: number;
  bot?: boolean;
  online?: boolean;
}

export function Avatar({ id, name, src, size = 44, bot, online }: AvatarProps) {
  const style = { ...avatarStyle(id), width: size, height: size, fontSize: size * 0.36 };
  return (
    <div className={`avatar${bot ? " bot" : ""}`} style={style}>
      {bot ? <BotIcon /> : src ? <img src={src} alt="" /> : initials(name)}
      {online && <span className="dot" />}
    </div>
  );
}

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" width="46%" height="46%" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="11" rx="3" />
      <path d="M12 8V4M9 4h6" />
      <circle cx="9" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
