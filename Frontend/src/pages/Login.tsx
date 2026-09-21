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

export default function Login() {
  const { loginPassword, loginCode } = useAuth();
  const { notifyError } = useToast();
  const navigate = useNavigate();
  const countdown = useCountdown();

  const [mode, setMode] = useState<"password" | "code">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    if (!EMAIL_RE.test(email)) {
      notifyError(null, "请输入正确的邮箱");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "password") {
        await loginPassword({ email, password });
      } else {
        await loginCode({ email, code });
      }
      navigate("/chat", { replace: true });
    } catch (e) {
      notifyError(e, "登录失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="signin-wrap">
      <form className="signin-card" onSubmit={onSubmit}>
        <BrandMark />
        <h1 className="signin-h1">欢迎回来</h1>
        <p className="signin-sub">登录以继续使用 SuperChat</p>

        <div className="tab-row" role="tablist">
          <button
            type="button"
            className={mode === "password" ? "active" : ""}
            onClick={() => setMode("password")}
          >
            密码登录
          </button>
          <button type="button" className={mode === "code" ? "active" : ""} onClick={() => setMode("code")}>
            验证码登录
          </button>
        </div>

        <label className="field-label" htmlFor="loginEmail">邮箱</label>
        <input
          id="loginEmail"
          className="field"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {mode === "password" ? (
          <>
            <label className="field-label" htmlFor="loginPass">密码</label>
            <input
              id="loginPass"
              className="field"
              type="password"
              placeholder="输入密码"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <div className="row-between">
              <button type="button" className="link" onClick={() => setMode("code")}>
                改用验证码登录
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="field-label" htmlFor="loginCode">验证码</label>
            <div className="code-row">
              <input
                id="loginCode"
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
          </>
        )}

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting && <span className="spinner" />}
          登录
        </button>

        <p className="signin-foot">
          还没有账号？<Link className="link" to="/register">注册</Link>
        </p>
      </form>
    </div>
  );
}
