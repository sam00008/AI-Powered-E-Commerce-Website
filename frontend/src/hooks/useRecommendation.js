
import { useState, useEffect } from "react";
import axios from "axios";

const useRecommendations = ({ type, productId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace with your actual backend URL if different
  const API_BASE_URL = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com/api/recommendations";

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        // Map the 'type' to your exact backend routes
        const endpoint = type === "similar" 
          ? `/similar/${productId}` 
          : `/frequently/${productId}`;

        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        
        // FIX: Extract the array from your backend's ApiResponse structure
        // Axios wraps everything in 'data', and your ApiResponse has a 'data' property
        const productsArray = response.data.data || []; 
        
        setData(productsArray);
      } catch (err) {
        console.error(`Error fetching ${type} recommendations:`, err);
        setError(err);
        setData([]); // Fallback to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [type, productId]);

  return { data, loading, error };
};

export default useRecommendations;