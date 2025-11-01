import React from "react";

const CategoryTile = ({ title, image, onClick, aspect = "aspect-[4/3]" }) => {
  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 w-full ${aspect}`}
    >
      {/* Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        onError={(e) => (e.target.style.display = "none")}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition duration-300"></div>

      {/* Title */}
      <div className="absolute bottom-6 left-6">
        <h3 className="text-white text-2xl font-semibold tracking-wide drop-shadow-lg">
          {title}
        </h3>
      </div>
    </div>
  );
};

export default CategoryTile;
