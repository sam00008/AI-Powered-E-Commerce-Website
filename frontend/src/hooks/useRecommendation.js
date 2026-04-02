import { useEffect, useState } from "react";
import axios from "axios";

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

        if (type === "personalized") {
          url = `/api/recommend/personalized?limit=${limit}`;
        } else if (type === "frequently" && productId) {
          url = `/api/recommend/frequently/${productId}?limit=${limit}`;
        } else if (type === "similar" && productId) {
          url = `/api/recommend/similar/${productId}?limit=${limit}`;
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