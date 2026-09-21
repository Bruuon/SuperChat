import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { contactApi } from "@/api/contact";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import type { ApplyFriendDTO, FriendDTO, FriendDetailVO } from "@/types/api";
import "./contacts.css";

export default function Contacts() {
  const { user } = useAuth();
  const { notify, notifyError } = useToast();
  const userId = user!.userId;

  const [friends, setFriends] = useState<FriendDTO[]>([]);
  const [applies, setApplies] = useState<ApplyFriendDTO[]>([]);
  const [keyword, setKeyword] = useState("");
  const [searchResult, setSearchResult] = useState<FriendDetailVO | "notfound" | null>(null);
  const [searching, setSearching] = useState(false);

  async function reload() {
    try {
      const [friendPage, applyPage] = await Promise.all([
        contactApi.getFriends(userId),
        contactApi.getApplyList(userId),
      ]);
      setFriends(friendPage.list);
      setApplies(applyPage.list.filter((a) => a.isReceiver === 1 && a.status === 0));
    } catch (e) {
      notifyError(e, "通讯录加载失败");
    }
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const sortedFriends = useMemo(
    () => [...friends].sort((a, b) => a.nickname.localeCompare(b.nickname, "zh-Hans-CN")),
    [friends],
  );

  async function doSearch() {
    if (!keyword.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const detail = await contactApi.searchUser(userId, keyword.trim());
      setSearchResult(detail);
    } catch {
      setSearchResult("notfound");
    } finally {
      setSearching(false);
    }
  }

  async function addFriend(targetId: string) {
    try {
      await contactApi.sendFriendRequest(userId, targetId, {});
      notify("好友申请已发送");
      setSearchResult(null);
      setKeyword("");
    } catch (e) {
      notifyError(e, "发送申请失败");
    }
  }

  async function respond(applicantId: string, accept: boolean) {
    try {
      await contactApi.modifyApplicationStatus(userId, accept ? 1 : 2, { receiveuserIds: [applicantId] });
      setApplies((prev) => prev.filter((a) => a.userId !== applicantId));
      if (accept) {
        notify("已添加为好友");
        reload();
      }
    } catch (e) {
      notifyError(e, "操作失败");
    }
  }

  async function removeFriend(friendId: string) {
    try {
      await contactApi.deleteFriend(userId, friendId);
      setFriends((prev) => prev.filter((f) => f.userId !== friendId));
    } catch (e) {
      notifyError(e, "删除好友失败");
    }
  }

  return (
    <div className="contacts-shell">
      <div className="contacts-head">
        <Link className="icon-pill-btn" to="/chat" aria-label="返回聊天">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <div className="contacts-title">通讯录</div>
      </div>

      <div className="contacts-search-row">
        <input
          className="field"
          placeholder="输入邮箱查找好友"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
        />
        <button className="btn-primary" style={{ width: "auto", padding: "0 18px", marginBottom: 0 }} disabled={searching} onClick={doSearch}>
          搜索
        </button>
      </div>

      {searchResult === "notfound" && <div className="search-result">没有找到这个用户</div>}
      {searchResult && searchResult !== "notfound" && (
        <div className="search-result">
          <Avatar id={searchResult.userId} name={searchResult.nickname} src={searchResult.avatar} size={38} />
          <div className="info">
            <div className="name">{searchResult.nickname}</div>
            <div className="sub">{searchResult.email}</div>
          </div>
          {searchResult.status === 0 ? (
            <span className="sub">已经是好友</span>
          ) : (
            <button className="pill-btn accept" onClick={() => addFriend(searchResult.userId)}>
              加好友
            </button>
          )}
        </div>
      )}

      <div className="contacts-body">
        {applies.length > 0 && (
          <>
            <div className="section-label">新的朋友</div>
            {applies.map((a) => (
              <div className="req-card" key={a.userId}>
                <Avatar id={a.userId} name={a.nickname} src={a.avatar} size={38} />
                <div className="req-body">
                  <div className="req-name">{a.nickname}</div>
                  <div className="req-sub">{a.msg || "请求添加你为好友"}</div>
                </div>
                <div className="req-actions">
                  <button className="pill-btn accept" onClick={() => respond(a.userId, true)}>接受</button>
                  <button className="pill-btn decline" onClick={() => respond(a.userId, false)}>忽略</button>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="section-label">全部好友 · {sortedFriends.length}</div>
        {sortedFriends.length === 0 && <div className="contacts-empty">还没有好友，搜索邮箱试试看</div>}
        {sortedFriends.map((f) => (
          <div className="friend-row" key={f.userId}>
            <Avatar id={f.userId} name={f.nickname} src={f.avatar} size={38} />
            <div>
              <div className="friend-name">{f.nickname}</div>
              <div className="friend-note">{f.signature || "这个人很懒，什么都没留下"}</div>
            </div>
            <div className="friend-actions">
              <button title="删除好友" aria-label="删除好友" onClick={() => removeFriend(f.userId)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
