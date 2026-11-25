"use client";

import Script from "next/script";

export default function CozeChat() {
  return (
    <Script
      src="https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/1.2.0-beta.6/libs/oversea/index.js"
      strategy="afterInteractive"
      onLoad={() => {
        const coze = (window as Record<string, unknown>).CozeWebSDK as
          | { WebChatClient: new (options: unknown) => void }
          | undefined;

        if (coze?.WebChatClient) {
          new coze.WebChatClient({
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