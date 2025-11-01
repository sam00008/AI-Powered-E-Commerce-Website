import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../component/ProductCard.jsx";

function SearchResults() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");
  
  // Use results from Nav, or empty array as default
  const [results, setResults] = useState(location.state?.results || []);
  const [loading, setLoading] = useState(false);

  // This effect handles the case where the user refreshes the page.
  // location.state is lost on refresh, so we re-fetch using the URL query.
  useEffect(() => {
    // If we have results from location.state, we don't need to fetch
    if (location.state?.results) {
      setResults(location.state.results);
      return;
    }

    // If we have no state, fetch results
    const fetchResults = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/product/search?query=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        
        // --- FIX: Check for data.status === 200, not data.success ---
        if (data.status === 200 && data.data) {
          setResults(data.data);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Search fetch error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, location.state]); // Re-run if query changes or state appears

  if (loading) {
    return <p className="text-center text-gray-700 text-lg py-6">Loading results for "{query}"...</p>;
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Search Results for "{query}"
      </h1>
      
      {/* We removed the extra search bar. The Nav bar is the only search. */}

      {results.length === 0 ? (
        <p className="text-center text-gray-700 text-lg">No Products Found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;