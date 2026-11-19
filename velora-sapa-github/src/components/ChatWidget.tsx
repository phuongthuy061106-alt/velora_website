"use client";

import { useEffect, useRef, useState } from "react";
import { HOTEL, type Lang } from "@/lib/hotel";
import { dict } from "@/lib/i18n";
import s from "./ChatWidget.module.css";

// D6: khung chat AI Concierge (Coze Web SDK).
// Cấu hình bằng biến môi trường; thiếu thì hiện khung liên hệ lễ tân để website vẫn dùng được.
const BOT_ID = process.env.NEXT_PUBLIC_COZE_BOT_ID;
const TOKEN = process.env.NEXT_PUBLIC_COZE_TOKEN;
const SDK_URL =
  process.env.NEXT_PUBLIC_COZE_SDK_URL ??
  "https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.10/libs/oversea/index.js";

type CozeClient = { showChatBot?: () => void; destroy?: () => void };
declare global {
  interface Window {
    CozeWebSDK?: { WebChatClient: new (opts: unknown) => CozeClient };
  }
}

export default function ChatWidget({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const client = useRef<CozeClient | null>(null);
  const enabled = !!(BOT_ID && TOKEN);

  useEffect(() => {
    if (!enabled) return;
    const s = document.createElement("script");
    s.src = SDK_URL;
    s.async = true;
    s.onload = () => {
      if (!window.CozeWebSDK) return;
      client.current = new window.CozeWebSDK.WebChatClient({
        config: { bot_id: BOT_ID },
        auth: { type: "token", token: TOKEN, onRefreshToken: () => TOKEN },
        ui: {
          base: { lang: lang === "vi" ? "vi" : "en", layout: "pc" },
          asstBtn: { isNeed: false },
          chatBot: { title: t.chat.title, width: 420 },
        },
      });
      setReady(true);
    };
    document.body.appendChild(s);
    return () => {
      client.current?.destroy?.();
      s.remove();
    };
  }, [enabled, lang, t.chat.title]);

  const onLauncher = () => {
    if (enabled && ready && client.current?.showChatBot) client.current.showChatBot();
    else setOpen((v) => !v);
  };

  return (
    <div className={s.root}>
      {open && (
        <div className={s.panel} role="dialog" aria-label={t.chat.title}>
          <div className={s.head}>
            <span className={s.avatar} aria-hidden>
              V
            </span>
            <div>
              <p className={s.title}>{t.chat.title}</p>
              <p className={s.sub}>{t.chat.sub}</p>
            </div>
            <button type="button" className={s.close} onClick={() => setOpen(false)} aria-label={t.nav.close}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          <div className={s.body}>
            <p className={s.bubble}>{t.chat.hello}</p>
            <p className={s.bubble}>{t.chat.offline}</p>
            <ul className={s.contacts}>
              <li>
                <a href={`tel:${HOTEL.hotline.replace(/\s/g, "")}`}>{HOTEL.hotline}</a>
              </li>
              <li>
                <a href={`mailto:${HOTEL.email}`}>{HOTEL.email}</a>
              </li>
            </ul>
          </div>
        </div>
      )}
      <button type="button" className={s.launcher} onClick={onLauncher} aria-expanded={open} aria-label={t.chat.open}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M8.5 9.5h7M8.5 12.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
