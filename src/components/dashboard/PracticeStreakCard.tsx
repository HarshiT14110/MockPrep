import { motion } from "motion/react";
import { Flame } from "lucide-react";

export default function PracticeStreakCard({ streak, T }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 16,
        padding: 22,
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        display: "flex",
        alignItems: "center",
        gap: 16
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: T.accentSoft
        }}
      >
        <Flame size={20} color={T.accent} />
      </div>

      <div>
        <p style={{ fontSize: 12, color: T.textMuted }}>Practice Streak</p>
        <h3 style={{ fontSize: 20, fontWeight: 700 }}>
          {streak} Day{streak !== 1 ? "s" : ""}
        </h3>
      </div>
    </motion.div>
  );
}