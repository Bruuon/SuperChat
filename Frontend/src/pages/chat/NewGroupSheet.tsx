import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { contactApi } from "@/api/contact";
import { groupApi } from "@/api/group";
import { useToast } from "@/context/ToastContext";
import type { FriendDTO } from "@/types/api";
import type { Conversation } from "@/types/chat";
import { SessionType } from "@/types/api";

interface NewGroupSheetProps {
  currentUserId: number;
  onClose: () => void;
  onCreated: (conversation: Conversation) => void;
}

export function NewGroupSheet({ currentUserId, onClose, onCreated }: NewGroupSheetProps) {
  const { notifyError } = useToast();
  const [friends, setFriends] = useState<FriendDTO[]>([]);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    contactApi
      .getFriends(currentUserId)
      .then((page) => setFriends(page.list))
      .catch((e) => notifyError(e, "好友列表加载失败"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  function toggle(userId: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function submit() {
    if (picked.size < 2) return notifyError(null, "至少选择 2 位好友才能建群");
    setSubmitting(true);
    try {
      const res = await groupApi.createGroup({
        creatorId: currentUserId,
        memberIds: [...picked].map(Number),
      });
      onCreated({
        sessionId: Number(res.sessionId),
        sessionType: SessionType.GROUP,
        name: res.sessionName,
        avatar: res.avatar,
        unread: 0,
      });
    } catch (e) {
      notifyError(e, "创建群聊失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="sheet">
        <button className="sheet-close" onClick={onClose} aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="sheet-grip" />
        <h3>新建群聊</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 4px" }}>
          选择要邀请的好友（至少 2 位）
        </p>

        {loading ? (
          <div style={{ padding: "24px 0", display: "flex", justifyContent: "center" }}>
            <span className="spinner" />
          </div>
        ) : friends.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "var(--muted)" }}>还没有好友，先去通讯录添加吧</p>
        ) : (
          <div className="member-pick">
            {friends.map((f) => (
              <div
                key={f.userId}
                className={`member-chip${picked.has(f.userId) ? " picked" : ""}`}
                onClick={() => toggle(f.userId)}
                role="checkbox"
                aria-checked={picked.has(f.userId)}
                tabIndex={0}
              >
                <Avatar id={f.userId} name={f.nickname} src={f.avatar} size={24} />
                {f.nickname}
              </div>
            ))}
          </div>
        )}

        <button className="btn-primary" disabled={submitting || picked.size < 2} onClick={submit}>
          {submitting && <span className="spinner" />}
          创建群聊
        </button>
      </div>
    </div>
  );
}
