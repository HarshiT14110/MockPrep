import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function RedirectToDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 800); // wait for animation
    }
  }, [navigate]);

  return null;
}