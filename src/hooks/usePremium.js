// src/hooks/usePremium.js
import { useEffect, useState } from "react";
import axios from "axios";

const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPremiumStatus = async () => {
      try {
        const token = localStorage.getItem("token"); // adjust if you use cookies
        if (!token) {
          setIsPremium(false);
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/user/premium", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsPremium(response.data.premium);
      } catch (error) {
        console.error("Error fetching premium status:", error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumStatus();
  }, []);

  return { isPremium, loading };
};

export default usePremium;
