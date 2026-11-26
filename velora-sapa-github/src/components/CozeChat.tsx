"use client";

export default function CozeChat() {
  // ✅ Đường link sạch chuẩn xác
  const agentUrl = "https://www.coze.com/store/agent/7706818166441213957?bot_id=true";

  return (
    <a
      href={agentUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Velora AI Concierge"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        backgroundColor: "#1c1917",
        color: "#ffffff",
        padding: "14px 20px",
        borderRadius: "9999px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        fontWeight: 600,
        fontSize: "14px",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
      }}
    >
      <span>💬</span>
      <span>Velora AI Concierge</span>
    </a>
  );
}