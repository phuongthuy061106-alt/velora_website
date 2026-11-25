"use client";

import Script from "next/script";

declare global {
  interface Window {
    CozeWebSDK?: {
      WebChatClient: new (options: Record<string, unknown>) => unknown;
    };
  }
}

export default function CozeChat() {
  return (
    <Script
      src="https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (window.CozeWebSDK) {
          new window.CozeWebSDK.WebChatClient({
            config: {
              bot_id: "7706818166441213957",
            },
            componentProps: {
              title: "Velora AI Concierge",
            },
            auth: {
              type: "token",
              token: "pat_dCbcQeELt8rf2JYxvVDKaCWStBWR6bTnlHTg5X8PZ6pDgi65UamyugF8PL7FpDwm",
              onRefreshToken: () => "pat_dCbcQeELt8rf2JYxvVDKaCWStBWR6bTnlHTg5X8PZ6pDgi65UamyugF8PL7FpDwm",
            },
          });
        }
      }}
    />
  );
}