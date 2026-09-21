import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authApi } from "@/api/auth";
import { useCountdown } from "@/utils/useCountdown";
import { BrandMark } from "@/components/BrandMark";
import "./auth.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register } = useAuth();
  const { notifyError } = useToast();
  const navigate = useNavigate();
  const countdown = useCountdown();

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sendingCaptcha, setSendingCaptcha] = useState(false);

  async function sendCaptcha() {
    if (!EMAIL_RE.test(email)) {
      notifyError(null, "请先输入正确的邮箱");
      return;
    }
    setSendingCaptcha(true);
    try {
      await authApi.sendCaptcha(email);
      countdown.start();
    } catch (e) {
      notifyError(e, "验证码发送失败");
    } finally {
      setSendingCaptcha(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) return notifyError(null, "请输入正确的邮箱");
    if (password.length < 6) return notifyError(null, "密码至少 6 位");
    if (password !== confirmPassword) return notifyError(null, "两次输入的密码不一致");
    if (!/^\d{6}$/.test(code)) return notifyError(null, "请输入 6 位验证码");

    setSubmitting(true);
    try {
      await register({ email, password, confirmPassword, code, nickname: nickname || undefined });
      navigate("/chat", { replace: true });
    } catch (e) {
      notifyError(e, "注册失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="signin-wrap">
      <form className="signin-card" onSubmit={onSubmit}>
        <BrandMark />
        <h1 className="signin-h1">创建账号</h1>
        <p className="signin-sub">加入 SuperChat，开始聊天</p>

        <label className="field-label" htmlFor="regEmail">邮箱</label>
        <input
          id="regEmail"
          className="field"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="field-label" htmlFor="regNickname">昵称（可选）</label>
        <input
          id="regNickname"
          className="field"
          placeholder="怎么称呼你"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={50}
        />

        <label className="field-label" htmlFor="regPass">密码</label>
        <input
          id="regPass"
          className="field"
          type="password"
          placeholder="6-20 位"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          maxLength={20}
          required
        />

        <label className="field-label" htmlFor="regConfirm">确认密码</label>
        <input
          id="regConfirm"
          className="field"
          type="password"
          placeholder="再输入一次密码"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <label className="field-label" htmlFor="regCode">验证码</label>
        <div className="code-row">
          <input
            id="regCode"
            className="field"
            inputMode="numeric"
            placeholder="6 位数字验证码"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />
          <button
            type="button"
            className="code-btn"
            disabled={countdown.running || sendingCaptcha}
            onClick={sendCaptcha}
          >
            {countdown.running ? `${countdown.seconds}s` : "获取验证码"}
          </button>
        </div>

        <button className="btn-primary" type="submit" disabled={submitting} style={{ marginTop: 4 }}>
          {submitting && <span className="spinner" />}
          注册
        </button>

        <p className="signin-foot">
          已经有账号？<Link className="link" to="/login">登录</Link>
        </p>
      </form>
    </div>
  );
}
