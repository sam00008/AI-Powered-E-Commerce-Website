import React from "react";
import { Link } from "react-router-dom";

const RecommendationSection = ({ title, products = [], loading }) => {
  if (loading) {
    return <p className="text-center py-6">Loading recommendations...</p>;
  }

  if (!products.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {products.map((product) => (
          <Link
            to={`/product/${product._id}`}
            key={product._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-3"
          >
            <img
              src={product.image1}
              alt={product.name}
              className="w-full h-40 object-cover rounded"
            />

            <h3 className="text-sm font-semibold mt-2 line-clamp-2">
              {product.name}
            </h3>

            <p className="text-gray-600 text-sm mt-1">
              ₹{product.price}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendationSection;