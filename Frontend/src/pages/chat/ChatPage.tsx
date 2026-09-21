import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { contactApi } from "@/api/contact";
import { messageApi } from "@/api/message";
import { realtimeSocket } from "@/ws/socket";
import type { MessageResponse } from "@/types/api";
import { MessageType, SessionType } from "@/types/api";
import type { Conversation } from "@/types/chat";
import { Sidebar } from "./Sidebar";
import { Thread } from "./Thread";
import { Composer } from "./Composer";
import { NewGroupSheet } from "./NewGroupSheet";
import { ClaimRedPacketSheet, SendRedPacketSheet } from "./RedPacketSheets";
import "./chat.css";

type PendingMessage = MessageResponse & { pending?: boolean };
type Sheet =
  | { kind: "newGroup" }
  | { kind: "sendRedPacket" }
  | { kind: "claimRedPacket"; redPacketId: string; senderId: number; senderName: string; wrapperText?: string | null }
  | null;

const HISTORY_PAGE_SIZE = 20;

export default function ChatPage() {
  const { user } = useAuth();
  const { notifyError } = useToast();

  const [conversations, setConversations] = useState<Record<number, Conversation>>({});
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messagesBySession, setMessagesBySession] = useState<Record<number, PendingMessage[]>>({});
  const [hasMoreBySession, setHasMoreBySession] = useState<Record<number, boolean>>({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);

  // WS 回调是长期存活的闭包（effect 依赖只有 [user]），用 ref 存"当前打开的会话"
  // 才能让它每次都读到最新值，而不是订阅时那一刻的值。
  const activeIdRef = useRef<number | null>(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const conversationList = useMemo(() => Object.values(conversations), [conversations]);
  const active = activeId != null ? (conversations[activeId] ?? null) : null;
  const activeMessages = activeId != null ? (messagesBySession[activeId] ?? []) : [];

  // ---- 初始加载：把好友列表转换成单聊会话 ----
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    contactApi
      .getFriends(user.userId)
      .then((page) => {
        if (cancelled) return;
        setConversations((prev) => {
          const next = { ...prev };
          for (const f of page.list) {
            const sid = Number(f.sessionId);
            if (!next[sid]) {
              next[sid] = {
                sessionId: sid,
                sessionType: SessionType.SIGNAL,
                name: f.nickname,
                avatar: f.avatar,
                peerId: Number(f.userId),
                unread: 0,
              };
            }
          }
          return next;
        });
      })
      .catch((e) => notifyError(e, "会话列表加载失败"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  // ---- WebSocket 消息接入（长连接，只订阅一次） ----
  useEffect(() => {
    if (!user) return;
    const unsubscribe = realtimeSocket.onMessage((msg) => {
      if (msg.type < 0 || msg.type > 99) return; // 100+ 是系统通知，暂不在聊天流里处理
      const sid = msg.sessionId;
      const isActiveNow = sid === activeIdRef.current;
      const mine = msg.senderId === user.userId;

      setMessagesBySession((prev) => {
        const list = prev[sid] ?? [];
        const dedupIndex = msg.clientMessageId
          ? list.findIndex((m) => m.clientMessageId === msg.clientMessageId)
          : -1;
        if (dedupIndex >= 0) {
          const copy = [...list];
          copy[dedupIndex] = msg;
          return { ...prev, [sid]: copy };
        }
        if (list.some((m) => m.messageId === msg.messageId)) return prev;
        return { ...prev, [sid]: [...list, msg] };
      });

      setConversations((prev) => {
        const existing = prev[sid];
        if (existing) {
          return {
            ...prev,
            [sid]: {
              ...existing,
              lastMessage: msg,
              unread: mine || isActiveNow ? existing.unread : existing.unread + 1,
            },
          };
        }
        // 收到一个还不在会话列表里的会话消息（比如刚被拉进的群）：先占个位，之后可以补拉详情
        return {
          ...prev,
          [sid]: {
            sessionId: sid,
            sessionType: msg.sessionType,
            name: msg.sessionType === SessionType.GROUP ? "群聊" : msg.nickname || "新会话",
            avatar: msg.avatar,
            peerId: msg.sessionType === SessionType.SIGNAL ? msg.senderId : undefined,
            lastMessage: msg,
            unread: mine || isActiveNow ? 0 : 1,
          },
        };
      });
    });
    return unsubscribe;
  }, [user]);

  const loadHistory = useCallback(async (sessionId: number, before: number) => {
    const list = await messageApi.getHistoryMessages({
      sessionId,
      beforeTime: before,
      limit: HISTORY_PAGE_SIZE,
    });
    setMessagesBySession((prev) => {
      const existing = prev[sessionId] ?? [];
      const merged = [...list, ...existing];
      const seen = new Set<number>();
      const dedup = merged.filter((m) => (seen.has(m.messageId) ? false : (seen.add(m.messageId), true)));
      return { ...prev, [sessionId]: dedup };
    });
    setHasMoreBySession((prev) => ({ ...prev, [sessionId]: list.length >= HISTORY_PAGE_SIZE }));
  }, []);

  function selectConversation(sessionId: number) {
    setActiveId(sessionId);
    setMobileDetailOpen(true);
    setConversations((prev) =>
      prev[sessionId] ? { ...prev, [sessionId]: { ...prev[sessionId], unread: 0 } } : prev,
    );
    if (!(sessionId in messagesBySession)) {
      loadHistory(sessionId, Date.now()).catch((e) => notifyError(e, "消息加载失败"));
    }
  }

  async function loadMore() {
    if (!active || loadingMore) return;
    const list = messagesBySession[active.sessionId] ?? [];
    const oldest = list[0]?.createdTime;
    const before = oldest ? new Date(oldest.replace(" ", "T")).getTime() : Date.now();
    setLoadingMore(true);
    try {
      await loadHistory(active.sessionId, before || Date.now());
    } catch (e) {
      notifyError(e, "消息加载失败");
    } finally {
      setLoadingMore(false);
    }
  }

  function sendText(text: string) {
    if (!active || !user) return;
    const clientMessageId = crypto.randomUUID();
    const optimistic: PendingMessage = {
      sessionId: active.sessionId,
      senderId: user.userId,
      type: MessageType.TEXT,
      sessionType: active.sessionType,
      createdTime: new Date().toISOString().replace("T", " ").slice(0, 19),
      messageId: -Date.now(),
      clientMessageId,
      nickname: user.nickname,
      avatar: user.avatar ?? undefined,
      body: { content: text },
      pending: true,
    };
    setMessagesBySession((prev) => ({
      ...prev,
      [active.sessionId]: [...(prev[active.sessionId] ?? []), optimistic],
    }));
    setConversations((prev) => ({
      ...prev,
      [active.sessionId]: { ...prev[active.sessionId], lastMessage: optimistic },
    }));
    realtimeSocket.send({
      sessionId: active.sessionId,
      receiverId: active.sessionType === SessionType.SIGNAL ? active.peerId : undefined,
      senderId: user.userId,
      type: MessageType.TEXT,
      sessionType: active.sessionType,
      body: { content: text },
      clientMessageId,
    });
  }

  const showThread = active != null && (mobileDetailOpen || !isMobile());

  return (
    <div className="stage">
      <div className="app">
        <Sidebar
          conversations={conversationList}
          activeId={activeId}
          onSelect={selectConversation}
          onNewGroup={() => setSheet({ kind: "newGroup" })}
          detailOpenOnMobile={mobileDetailOpen}
        />
        <Thread
          conversation={showThread ? active : null}
          messages={activeMessages}
          currentUserId={user?.userId ?? -1}
          onBack={() => setMobileDetailOpen(false)}
          onLoadMore={loadMore}
          hasMore={active ? !!hasMoreBySession[active.sessionId] : false}
          loadingMore={loadingMore}
          onOpenRedPacket={(redPacketId, msg) =>
            setSheet({
              kind: "claimRedPacket",
              redPacketId,
              senderId: msg.senderId,
              senderName: msg.senderId === user?.userId ? "我" : (msg.nickname ?? active?.name ?? "对方"),
              wrapperText: msg.body.redPacketWrapperText,
            })
          }
          composer={
            showThread ? (
              <Composer onSend={sendText} onOpenSendRedPacket={() => setSheet({ kind: "sendRedPacket" })} />
            ) : null
          }
        />
      </div>

      {sheet?.kind === "newGroup" && (
        <NewGroupSheet
          currentUserId={user!.userId}
          onClose={() => setSheet(null)}
          onCreated={(conv) => {
            setConversations((prev) => ({ ...prev, [conv.sessionId]: conv }));
            setSheet(null);
            selectConversation(conv.sessionId);
          }}
        />
      )}
      {sheet?.kind === "sendRedPacket" && active && (
        <SendRedPacketSheet
          conversation={active}
          currentUserId={user!.userId}
          onClose={() => setSheet(null)}
          onSent={() => setSheet(null)}
        />
      )}
      {sheet?.kind === "claimRedPacket" && (
        <ClaimRedPacketSheet
          redPacketId={sheet.redPacketId}
          senderId={sheet.senderId}
          senderName={sheet.senderName}
          wrapperText={sheet.wrapperText}
          currentUserId={user!.userId}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  );
}

// 简化实现：只在触发判断的那一刻查一次 matchMedia，不监听 resize。
// 真机上够用；如果要支持桌面窗口实时拖拽跨越断点，后续可以换成 useMediaQuery hook。
function isMobile() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 600px)").matches;
}
