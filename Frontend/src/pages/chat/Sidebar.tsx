import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { useAuth } from "@/context/AuthContext";
import type { Conversation } from "@/types/chat";
import { SessionType } from "@/types/api";
import { formatRelative } from "@/utils/format";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (sessionId: string) => void;
  onNewGroup: () => void;
  onOpenProfile: () => void;
  detailOpenOnMobile: boolean;
}

function previewOf(c: Conversation): string {
  const body = c.lastMessage?.body;
  if (!body) return c.sessionType === SessionType.ROBOT ? "问我任何问题" : "开始聊天吧";
  if (body.redPacketId) return "[红包]";
  return body.content || "";
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewGroup,
  onOpenProfile,
  detailOpenOnMobile,
}: SidebarProps) {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState("");

  const filtered = useMemo(() => {
    const list = [...conversations].sort((a, b) => {
      const ta = a.lastMessage?.createdTime ?? "";
      const tb = b.lastMessage?.createdTime ?? "";
      return tb.localeCompare(ta);
    });
    if (!keyword.trim()) return list;
    const k = keyword.trim().toLowerCase();
    return list.filter((c) => c.name.toLowerCase().includes(k));
  }, [conversations, keyword]);

  return (
    <div className={`pane-list${detailOpenOnMobile ? " detail-open" : ""}`}>
      <div className="list-head">
        <div className="switcher-row">
          <button className="sidebar-profile-btn" onClick={onOpenProfile} aria-label="我的资料">
            {user && <Avatar id={user.userId} name={user.nickname} src={user.avatar} size={30} />}
          </button>
          <div className="list-title" style={{ margin: 0 }}>聊天</div>
          <div className="header-actions">
            <Link className="icon-pill-btn" to="/contacts" title="通讯录" aria-label="通讯录">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.4" />
                <path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2" />
              </svg>
            </Link>
            <button className="icon-pill-btn" title="新建群聊" aria-label="新建群聊" onClick={onNewGroup}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
        <label className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label="搜索会话"
          />
        </label>
      </div>

      <div className="list-scroll">
        {filtered.length === 0 && <div className="list-empty">还没有会话，去通讯录加个好友吧</div>}
        {filtered.map((c) => (
          <button
            key={c.sessionId}
            className={`convo${c.sessionId === activeId ? " active" : ""}`}
            onClick={() => onSelect(c.sessionId)}
          >
            <Avatar id={c.peerId ?? c.sessionId} name={c.name} src={c.avatar} bot={c.sessionType === SessionType.ROBOT} />
            <div className="convo-body">
              <div className="convo-top">
                <span className="convo-name">{c.name}</span>
                <span className="convo-time tnum">{formatRelative(c.lastMessage?.createdTime)}</span>
              </div>
              <div className="convo-sub">{previewOf(c)}</div>
            </div>
            {c.unread > 0 && <span className="badge">{c.unread > 99 ? "99+" : c.unread}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
