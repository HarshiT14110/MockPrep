import { Github } from "lucide-react";

export default function Footer({ T, isDark }: any) {
  return (
    <footer
      style={{
        marginTop: 24,
        padding: "12px 32px",
        borderTop: `1px solid ${T.cardBorder}`,
        background: isDark
          ? "rgba(30,23,16,0.65)"
          : "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        fontSize: 12,
        color: T.textMuted,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      {/* LEFT */}
      <span>© {new Date().getFullYear()} MockPrep</span>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <a
          href="/privacy"
          style={{
            textDecoration: "none",
            color: T.textMuted
          }}
        >
          Privacy
        </a>

        <a
          href="/terms"
          style={{
            textDecoration: "none",
            color: T.textMuted
          }}
        >
          Terms
        </a>

        <a
          href="https://github.com/HarshiT14110"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Github size={14} color={T.textMuted} />
        </a>
      </div>
    </footer>
  );
}