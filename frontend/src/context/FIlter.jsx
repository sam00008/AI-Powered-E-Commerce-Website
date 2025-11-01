import React, { useState } from "react";

export default function Filter({ products, onFilter }) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);

  // Get min and max price from products
  const minPrice = Math.min(...products.map((p) => p.price));
  const maxPrice = Math.max(...products.map((p) => p.price));

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    applyFilter(e.target.value, priceRange);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value.split("-").map(Number);
    setPriceRange(value);
    applyFilter(selectedCategory, value);
  };

  const applyFilter = (category, price) => {
    let filtered = [...products];

    if (category) {
      filtered = filtered.filter(
        (p) =>
          p.subCategory.toLowerCase() === category.toLowerCase() ||
          p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (price) {
      filtered = filtered.filter(
        (p) => p.price >= price[0] && p.price <= price[1]
      );
    }

    onFilter(filtered);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h3 className="font-semibold text-gray-800 mb-2">Filter Products</h3>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Category / Subcategory</label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full p-2 border rounded"
        >
          <option value="">All</option>
          <option value="Topwear">Topwear</option>
          <option value="Lowerwear">Lowerwear</option>
          <option value="Underwear">Underwear</option>
        </select>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-gray-600 mb-1">Price Range</label>
        <select
          value={priceRange.join("-")}
          onChange={handlePriceChange}
          className="w-full p-2 border rounded"
        >
          <option value={`${minPrice}-${maxPrice}`}>All</option>
          <option value={`${minPrice}-50`}>0 - 50</option>
          <option value="51-100">51 - 100</option>
          <option value="101-200">101 - 200</option>
          <option value="201-500">201 - 500</option>
          <option value="501-1000">501 - 1000</option>
        </select>
      </div>
    </div>
  );
}
