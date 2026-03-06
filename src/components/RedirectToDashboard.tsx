import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function RedirectToDashboard() {
  const { isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setTimeout(() => {
        navigate("/dashboard");
      }, 800); // wait for animation
    }
  }, [isLoaded, isSignedIn, navigate]);

  return null;
}