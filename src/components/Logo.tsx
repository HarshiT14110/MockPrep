import React from "react";
import logo from "../assets/logo.png";
import darkLogo from "../assets/dark-logo.png";
import { useTheme } from "../lib/ThemeContext.js";

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 40 }: LogoProps) {

  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <img
      src={isDark ? darkLogo : logo}
      alt="MockPrep"
      style={{
  height: size,
  width: "auto",
  objectFit: "contain",
  filter: isDark ? "drop-shadow(0 0 10px rgba(201,130,10,0.5))" : "none"
}}
    />
  );
}