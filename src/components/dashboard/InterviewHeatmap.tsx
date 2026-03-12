import React from "react";

export default function InterviewHeatmap({ T }: any) {

  const days = Array.from({ length: 35 }, (_, i) => ({
    value: Math.floor(Math.random() * 4)
  }));

  const colors = [
    "rgba(200,200,200,0.15)",
    "#c9820a33",
    "#c9820a66",
    "#c9820a"
  ];

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
        fontWeight: 700,
        marginBottom: 14
      }}>
        Practice Activity
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6
        }}
      >

        {days.map((d, i) => (
          <div
            key={i}
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              background: colors[d.value]
            }}
          />
        ))}

      </div>

      <p style={{
        fontSize: 11,
        marginTop: 10,
        opacity: 0.6
      }}>
        Last 35 days interview practice
      </p>

    </div>
  );
}