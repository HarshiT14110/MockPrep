import { motion } from "motion/react";
import recruiterAvatar from "../assets/recruiter.png";

interface Props {
  speaking: boolean;
  mouthLevel: number;
}

export default function AIRecruiterAvatar({ speaking, mouthLevel }: Props) {
  const mouthHeight = Math.max(3, mouthLevel * 30);

  return (
    <div
      style={{
        position: "relative",
        width: 120,
        height: 120,
        borderRadius: "50%",
        overflow: "hidden",
        border: "2px solid rgba(201,130,10,0.5)",
        boxShadow: "0 6px 30px rgba(0,0,0,0.5)"
      }}
    >
      <img
        src={recruiterAvatar}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />

      {/* Real lip sync mouth */}
      {speaking && (
        <motion.div
          animate={{ height: mouthHeight }}
          transition={{ duration: 0.05 }}
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            width: 18,
            background: "#111",
            borderRadius: 10
          }}
        />
      )}
    </div>
  );
}