import { useEffect, useState } from "react";
import axios from "axios";

// 1. Define your backend base URL here
const API_BASE_URL = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com";

const useRecommendations = ({ type, productId, limit = 10 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!type) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        let url = "";

        // 2. Prepend the API_BASE_URL to all your endpoints
        if (type === "personalized") {
          url = `${API_BASE_URL}/api/recommend/personalized?limit=${limit}`;
        } else if (type === "frequently" && productId) {
          url = `${API_BASE_URL}/api/recommend/frequently/${productId}?limit=${limit}`;
        } else if (type === "similar" && productId) {
          url = `${API_BASE_URL}/api/recommend/similar/${productId}?limit=${limit}`;
        }

        if (!url) {
          setLoading(false);
          return;
        }

        const res = await axios.get(url, { withCredentials: true });

        setData(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching recommendations");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, productId, limit]);

  return { data, loading, error };
};

export default useRecommendations;