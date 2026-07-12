import React from "react";
import { Link } from "react-router-dom";

const RecommendationSection = ({ title, products = [], loading }) => {
  if (loading) {
    return <p className="text-center py-6 text-gray-500">Loading recommendations...</p>;
  }

  // FIX: Bulletproof check to ensure products is a valid array with items
// Change this part:
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <div className="mt-10 p-6 bg-red-50 text-red-600 rounded-lg text-center border border-red-200">
        <p className="font-bold">Debugging Info: {title} returned 0 items.</p>
        <p className="text-sm">Check your database or Network tab.</p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <Link
            to={`/product/${product._id}`}
            key={product._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-3 block"
          >
            <img
              src={product.image1}
              alt={product.name}
              className="w-full h-40 object-cover rounded"
            />

            <h3 className="text-sm font-semibold mt-2 line-clamp-2">
              {product.name}
            </h3>

            <p className="text-pink-600 font-medium text-sm mt-1">
              ₹{product.price}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendationSection;