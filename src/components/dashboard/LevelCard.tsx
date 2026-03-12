import React from "react";
import { motion } from "motion/react";

export default function LevelCard({ xp, T }) {

  const level = Math.floor(xp / 100);
  const progress = xp % 100;

  return (
    <div
      style={{
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 20,
        padding: 24
      }}
    >

      <h3 style={{ fontSize: 14, fontWeight: 700 }}>
        Your Level
      </h3>

      <p style={{
        fontSize: 22,
        fontWeight: 700,
        marginTop: 8,
        color: T.accent
      }}>
        Level {level}
      </p>

      <div
        style={{
          height: 8,
          background: T.accentSoft,
          borderRadius: 6,
          marginTop: 14,
          overflow: "hidden"
        }}
      >

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2 }}
          style={{
            height: "100%",
            background: T.accent
          }}
        />

      </div>

      <p style={{
        fontSize: 11,
        marginTop: 8,
        opacity: 0.6
      }}>
        {progress}/100 XP to next level
      </p>

    </div>
  );
}