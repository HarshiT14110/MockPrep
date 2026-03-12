import React from "react";

export default function AICoachCard({ T }: any) {

  return (
    <div
      style={{
        background: T.cardBg,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 20,
        padding: 24
      }}
    >

      <h3 style={{
        fontSize: 14,
        fontWeight: 700
      }}>
        AI Interview Coach
      </h3>

      <p style={{
        fontSize: 12,
        marginTop: 10,
        lineHeight: 1.6,
        opacity: 0.8
      }}>
        You struggle with System Design questions.
        Recommended next practice: Microservices Architecture.
      </p>

      <button
        style={{
          marginTop: 14,
          padding: "8px 14px",
          borderRadius: 10,
          border: "none",
          background: T.accent,
          color: "#fff",
          fontSize: 12,
          cursor: "pointer"
        }}
      >
        Start Practice
      </button>

    </div>
  );
}