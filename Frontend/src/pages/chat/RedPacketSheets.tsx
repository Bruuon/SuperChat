import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { redPacketApi } from "@/api/redpacket";
import { useToast } from "@/context/ToastContext";
import { SessionType } from "@/types/api";
import type { Conversation } from "@/types/chat";
import { formatAmount } from "@/utils/format";

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button className="sheet-close" onClick={onClick} aria-label="关闭">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    </button>
  );
}

// -------------------- 发红包 --------------------
interface SendSheetProps {
  conversation: Conversation;
  currentUserId: string;
  onClose: () => void;
  onSent: () => void;
}

export function SendRedPacketSheet({ conversation, currentUserId, onClose, onSent }: SendSheetProps) {
  const { notifyError, notify } = useToast();
  const isGroup = conversation.sessionType === SessionType.GROUP;
  const [type, setType] = useState<0 | 1>(isGroup ? 1 : 0);
  const [amount, setAmount] = useState("");
  const [count, setCount] = useState(isGroup ? "3" : "1");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const amountNum = Number(amount);
    const countNum = Math.max(1, Math.floor(Number(count) || 1));
    if (!amountNum || amountNum <= 0) return notifyError(null, "请输入红包金额");
    if (isGroup && countNum < 1) return notifyError(null, "红包个数至少为 1");

    setSubmitting(true);
    try {
      await redPacketApi.send({
        sessionId: conversation.sessionId,
        receiverId: isGroup ? null : conversation.peerId,
        senderId: currentUserId,
        type: 3,
        sessionType: conversation.sessionType,
        body: {
          redPacketType: type,
          totalAmount: amountNum,
          totalCount: isGroup ? countNum : 1,
          redPacketWrapperText: text || undefined,
        },
        clientMessageId: crypto.randomUUID(),
      });
      notify("红包已发出");
      onSent();
    } catch (e) {
      notifyError(e, "红包发送失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay">
      <div className="sheet">
        <CloseBtn onClick={onClose} />
        <div className="sheet-grip" />
        <h3>发红包</h3>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px" }}>
          发给 {conversation.name}
        </p>

        {isGroup && (
          <div className="tab-row" style={{ marginBottom: 16 }}>
            <button type="button" className={type === 1 ? "active" : ""} onClick={() => setType(1)}>
              拼手气红包
            </button>
            <button type="button" className={type === 0 ? "active" : ""} onClick={() => setType(0)}>
              普通红包
            </button>
          </div>
        )}

        <label className="field-label" htmlFor="rpAmount">
          {isGroup ? "总金额（元）" : "金额（元）"}
        </label>
        <input
          id="rpAmount"
          className="field"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
        />

        {isGroup && (
          <>
            <label className="field-label" htmlFor="rpCount">红包个数</label>
            <input
              id="rpCount"
              className="field"
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))}
            />
          </>
        )}

        <label className="field-label" htmlFor="rpText">祝福语（可选）</label>
        <input
          id="rpText"
          className="field"
          placeholder="恭喜发财，大吉大利"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={40}
        />

        <button className="btn-primary" disabled={submitting} onClick={submit} style={{ marginTop: 4 }}>
          {submitting && <span className="spinner" />}
          塞入红包
        </button>
      </div>
    </div>
  );
}

// -------------------- 领红包 --------------------
interface ClaimSheetProps {
  redPacketId: string;
  senderId: string;
  senderName: string;
  wrapperText?: string | null;
  currentUserId: string;
  onClose: () => void;
}

export function ClaimRedPacketSheet({
  redPacketId,
  senderId,
  senderName,
  wrapperText,
  currentUserId,
  onClose,
}: ClaimSheetProps) {
  const { notifyError } = useToast();
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState<{ amount: number | null; message?: string } | null>(null);
  const [progress, setProgress] = useState<{ received: number; total: number; sum: number } | null>(null);

  useEffect(() => {
    redPacketApi
      .getBasic(redPacketId)
      .then((basic) =>
        setProgress({ received: basic.receivedCount, total: basic.totalCount, sum: basic.totalAmount }),
      )
      .catch(() => void 0);
  }, [redPacketId]);

  async function open() {
    setOpening(true);
    try {
      const res = await redPacketApi.receive({ userId: currentUserId, redPacketId });
      setResult({ amount: res.amount, message: res.message });
      redPacketApi
        .getBasic(redPacketId)
        .then((basic) =>
          setProgress({ received: basic.receivedCount, total: basic.totalCount, sum: basic.totalAmount }),
        )
        .catch(() => void 0);
    } catch (e) {
      notifyError(e, "领取失败");
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="overlay">
      <div className="sheet rp-sheet">
        <CloseBtn onClick={onClose} />
        <div className="rp-from">
          <Avatar id={senderId} name={senderName} size={52} />
          <div style={{ fontSize: 13, opacity: 0.85 }}>{senderName} 的红包</div>
        </div>
        <div className="rp-note">{wrapperText || "恭喜发财，大吉大利"}</div>

        <div className="rp-stage">
          {!result ? (
            <button className="rp-open-btn" onClick={open} disabled={opening}>
              开
            </button>
          ) : result.amount != null ? (
            <>
              <div className="rp-amount tnum">
                <sup>¥</sup>
                {formatAmount(result.amount)}
              </div>
              <div className="rp-lucky">已存入零钱 🎉</div>
            </>
          ) : (
            <div className="rp-lucky">{result.message || "手慢了，红包派完了"}</div>
          )}
        </div>

        {progress && (
          <div className="rp-progress">
            <div className="rp-progress-row">
              <span>
                已被 {progress.received}/{progress.total} 位好友领取
              </span>
              <span className="tnum">共 ¥{formatAmount(progress.sum)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
