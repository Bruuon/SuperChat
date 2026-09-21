import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { groupApi } from "@/api/group";
import { useToast } from "@/context/ToastContext";
import type { GroupMemberVO } from "@/types/api";

const ROLE_LABEL: Record<number, string> = { 0: "群主", 1: "管理员", 2: "成员" };

interface GroupMembersSheetProps {
  sessionId: string;
  currentUserId: string;
  onClose: () => void;
  /** 自己退群/被移出后，把这个会话从列表里摘掉 */
  onLeft: () => void;
}

export function GroupMembersSheet({ sessionId, currentUserId, onClose, onLeft }: GroupMembersSheetProps) {
  const { notify, notifyError } = useToast();
  const [members, setMembers] = useState<GroupMemberVO[] | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  function reload() {
    groupApi
      .getMembers(sessionId)
      .then(setMembers)
      .catch((e) => notifyError(e, "群成员加载失败"));
  }
  useEffect(reload, [sessionId]);

  const me = members?.find((m) => m.userId === currentUserId);
  const canManage = me != null && (me.role === 0 || me.role === 1);

  async function kick(target: GroupMemberVO) {
    setBusyUserId(target.userId);
    try {
      await groupApi.kickMember(sessionId, currentUserId, target.userId);
      notify(`已将 ${target.nickname} 移出群聊`);
      setMembers((prev) => prev?.filter((m) => m.userId !== target.userId) ?? null);
    } catch (e) {
      notifyError(e, "移出失败");
    } finally {
      setBusyUserId(null);
    }
  }

  async function leave() {
    setBusyUserId(currentUserId);
    try {
      await groupApi.leaveGroup(sessionId, currentUserId);
      notify("已退出群聊");
      onClose();
      onLeft();
    } catch (e) {
      notifyError(e, "退群失败");
      setBusyUserId(null);
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
        <h3>群成员{members ? ` · ${members.length}` : ""}</h3>

        <div className="member-list">
          {!members && (
            <div style={{ padding: "24px 0", display: "flex", justifyContent: "center" }}>
              <span className="spinner" />
            </div>
          )}
          {members?.map((m) => (
            <div className="member-row" key={m.userId}>
              <Avatar id={m.userId} name={m.nickname} src={m.avatar} size={38} />
              <div className="member-row-body">
                <div className="member-row-name">
                  {m.nickname}
                  {m.userId === currentUserId && <span className="member-row-you">（我）</span>}
                </div>
                <div className="member-row-role">{ROLE_LABEL[m.role] ?? "成员"}</div>
              </div>
              {canManage && m.role !== 0 && m.userId !== currentUserId && (
                <button
                  className="pill-btn decline"
                  disabled={busyUserId === m.userId}
                  onClick={() => kick(m)}
                >
                  移出
                </button>
              )}
            </div>
          ))}
        </div>

        {me && (
          <button
            className="btn-secondary"
            style={{ color: "var(--danger)", borderColor: "var(--danger)", marginTop: 16 }}
            disabled={busyUserId === currentUserId}
            onClick={leave}
          >
            {busyUserId === currentUserId ? "退出中…" : "退出群聊"}
          </button>
        )}
      </div>
    </div>
  );
}
