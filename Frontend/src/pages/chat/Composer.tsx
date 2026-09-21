import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

interface ComposerProps {
  onSend: (text: string) => void;
  onOpenSendRedPacket: () => void;
  /** AI 助手会话不支持发红包 */
  allowRedPacket?: boolean;
  disabled?: boolean;
}

export function Composer({ onSend, onOpenSendRedPacket, allowRedPacket = true, disabled }: ComposerProps) {
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  function autoGrow() {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    requestAnimationFrame(autoGrow);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="composer-wrap">
      <div className="composer">
        {allowRedPacket && (
          <div className="composer-anchor">
            <button className="plus-btn" title="添加" aria-label="添加" onClick={() => setMenuOpen((v) => !v)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            {menuOpen && (
              <div className="attach-menu" onMouseLeave={() => setMenuOpen(false)}>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenSendRedPacket();
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <rect x="4" y="4" width="16" height="16" rx="3" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                  发红包
                </button>
              </div>
            )}
          </div>
        )}
        <textarea
          ref={fieldRef}
          className="composer-field"
          rows={1}
          placeholder="输入信息…"
          aria-label="输入消息"
          value={text}
          disabled={disabled}
          onChange={(e) => {
            setText(e.target.value);
            autoGrow();
          }}
          onKeyDown={onKeyDown}
        />
        <button className="send-btn" aria-label="发送" disabled={!text.trim() || disabled} onClick={submit}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 11.5 20.5 4 13 21.5l-2.7-7.3L3 11.5Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
