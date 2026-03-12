import { BrainCircuit } from "lucide-react";

export default function NextActionCard({ T }) {

  return (
    <div
      style={{
        borderRadius: 16,
        padding: 22,
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <BrainCircuit size={18} color={T.accent} />
        <h3>AI Next Action</h3>
      </div>

      <p style={{ marginTop: 10, color: T.textMuted }}>
        Practice 2 System Design problems to improve architecture thinking.
      </p>
    </div>
  );
}