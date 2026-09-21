import { useEffect, useRef } from "react";
import { Avatar } from "@/components/Avatar";
import type { MessageResponse } from "@/types/api";
import { MessageType, SessionType } from "@/types/api";
import type { Conversation } from "@/types/chat";
import { formatClock } from "@/utils/format";

interface ThreadProps {
  conversation: Conversation | null;
  messages: MessageResponse[];
  currentUserId: string;
  onBack: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  onOpenRedPacket: (redPacketId: string, messageBody: MessageResponse) => void;
  onOpenMembers: () => void;
  composer: React.ReactNode;
}

export function Thread({
  conversation,
  messages,
  currentUserId,
  onBack,
  onLoadMore,
  hasMore,
  loadingMore,
  onOpenRedPacket,
  onOpenMembers,
  composer,
}: ThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevLenRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const grew = messages.length > prevLenRef.current;
    prevLenRef.current = messages.length;
    if (grew) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    prevLenRef.current = 0;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [conversation?.sessionId]);

  if (!conversation) {
    return (
      <div className="pane-detail">
        <div className="empty-detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8A2.5 2.5 0 0 1 17.5 16H9l-4.2 3.5a.5.5 0 0 1-.8-.4V16" />
          </svg>
          <p>选择一个会话开始聊天</p>
        </div>
      </div>
    );
  }

  const isGroup = conversation.sessionType === SessionType.GROUP;

  return (
    <div className="pane-detail open">
      <div className="thread-head">
        <button className="back-btn" onClick={onBack} aria-label="返回列表">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="thread-who">
          <Avatar
            id={conversation.peerId ?? conversation.sessionId}
            name={conversation.name}
            src={conversation.avatar}
            bot={conversation.sessionType === SessionType.ROBOT}
            size={36}
          />
          <div>
            <div className="thread-name">{conversation.name}</div>
            <div className="thread-status">
              {conversation.sessionType === SessionType.SIGNAL && <span className="dot" />}
              {conversation.sessionType === SessionType.ROBOT
                ? "随时为你服务"
                : isGroup
                  ? "群聊"
                  : "在线"}
            </div>
          </div>
        </div>
        {isGroup && (
          <button className="icon-pill-btn" title="群成员" aria-label="群成员" onClick={onOpenMembers}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="8" r="3" />
              <path d="M2.5 19c0-3.3 2.9-5.7 6.5-5.7s6.5 2.4 6.5 5.7" />
              <circle cx="17" cy="8.5" r="2.4" />
              <path d="M15.5 13.6c2.9.4 5 2.5 5 5.4" />
            </svg>
          </button>
        )}
      </div>

      <div className="thread-scroll" ref={scrollRef}>
        {hasMore && (
          <button className="load-more" onClick={onLoadMore} disabled={loadingMore}>
            {loadingMore ? "加载中…" : "加载更早的消息"}
          </button>
        )}
        {messages.map((m, i) => {
          const mine = m.senderId === currentUserId;
          const showName = isGroup && !mine;
          return (
            <div key={m.clientMessageId ?? `${m.messageId}-${i}`}>
              <div className={`row ${mine ? "out" : "in"} first`}>
                {m.body.redPacketId ? (
                  <RedPacketCard message={m} onOpen={() => onOpenRedPacket(m.body.redPacketId!, m)} />
                ) : (
                  <div className={`bubble${(m as { pending?: boolean }).pending ? " pending" : ""}`}>
                    {m.body.content}
                  </div>
                )}
              </div>
              <div className={`meta-row${mine ? " out" : ""}`}>
                {showName && <span className="sender">{m.nickname}</span>}
                {formatClock(m.createdTime)}
              </div>
            </div>
          );
        })}
      </div>
      {composer}
    </div>
  );
}

function RedPacketCard({ message, onOpen }: { message: MessageResponse; onOpen: () => void }) {
  const wrapperText = message.body.redPacketWrapperText || "恭喜发财，大吉大利";
  return (
    <button className="packet-card" onClick={onOpen}>
      <div className="pc-top">
        <div className="pc-icon">
          <svg viewBox="0 0 40 40" fill="none">
            <rect x="4" y="4" width="32" height="32" rx="6" fill="currentColor" opacity=".18" />
            <circle cx="20" cy="20" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M20 14.5v11M15 20h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="pc-text">{wrapperText}</div>
      </div>
      <div className="pc-bottom">
        <span>点击查看</span>
        <span>{message.type === MessageType.RED_PACKET ? "红包" : ""}</span>
      </div>
    </button>
  );
}
