import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/Avatar";
import { authApi } from "@/api/auth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

interface ProfileSheetProps {
  onClose: () => void;
}

export function ProfileSheet({ onClose }: ProfileSheetProps) {
  const { user, logout, updateUser } = useAuth();
  const { notify, notifyError } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允许连续选同一张图重新上传
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      notifyError(null, "请选择图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notifyError(null, "图片不能超过 5MB");
      return;
    }
    setUploading(true);
    try {
      // 1. 找 UserService 要一个 MinIO 预签名直传地址
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const objectName = `avatar/${user.userId}-${Date.now()}.${ext}`;
      const { uploadUrl, downloadUrl } = await authApi.getUploadUrl(objectName);

      // 2. 直接 PUT 到 MinIO，不走网关（这段请求不应该带 Access-Token 头，
      //    所以特意用原生 fetch 而不是封装过网关拦截器的 axios 实例）
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) throw new Error(`上传失败（${putRes.status}）`);

      // 3. 把最终可访问地址写回用户资料
      await authApi.updateAvatar({ userId: user.userId, uri: downloadUrl });
      updateUser({ avatar: downloadUrl });
      notify("头像已更新");
    } catch (err) {
      notifyError(err, "头像上传失败");
    } finally {
      setUploading(false);
    }
  }

  async function onLogout() {
    await logout();
    onClose();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  return (
    <div className="overlay">
      <div className="sheet">
        <button className="sheet-close" onClick={onClose} aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="sheet-grip" />
        <h3>我的资料</h3>

        <div className="profile-avatar-row">
          <button
            className="profile-avatar-btn"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="更换头像"
          >
            <Avatar id={user.userId} name={user.nickname} src={user.avatar} size={72} />
            <span className="profile-avatar-edit">{uploading ? <span className="spinner" /> : "更换"}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onPickFile}
            aria-label="选择头像图片"
          />
          <div>
            <div className="profile-name">{user.nickname}</div>
            <div className="profile-email">{user.email}</div>
          </div>
        </div>

        <button className="btn-secondary" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={onLogout}>
          退出登录
        </button>
      </div>
    </div>
  );
}
