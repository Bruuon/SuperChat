import { useEffect, useRef, useState } from "react";

/** 验证码倒计时：seconds > 0 时表示"已发送，N 秒后可再次发送" */
export function useCountdown(initial = 60) {
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, []);

  function start() {
    setSeconds(initial);
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          if (timer.current !== null) window.clearInterval(timer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  return { seconds, running: seconds > 0, start };
}
