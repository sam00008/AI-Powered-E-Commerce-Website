// src/pages/Add.jsx
import React, { useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";

function Add() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    type: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    bestSeller: false,
  });

  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle text, select, and checkbox inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image uploads
  const handleImageChange = (e) => {
    const { name, files } = e.target;
    setImages((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const requiredFields = ["name", "description", "price", "category", "subCategory"];
      for (let field of requiredFields) {
        if (!formData[field]) {
          setMessage(`❌ Please fill ${field}`);
          setLoading(false);
          return;
        }
      }

      for (let img of ["image1", "image2", "image3", "image4"]) {
        if (!images[img]) {
          setMessage(`❌ Please upload ${img}`);
          setLoading(false);
          return;
        }
      }

      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });
      Object.entries(images).forEach(([key, file]) => {
        form.append(key, file);
      });

      const res = await fetch("http://localhost:3000/api/product/addproduct", {
        method: "POST",
        body: form,
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Product added successfully!");
        setFormData({
          name: "",
          brand: "",
          type: "",
          description: "",
          price: "",
          category: "",
          subCategory: "",
          bestSeller: false,
        });
        setImages({ image1: null, image2: null, image3: null, image4: null });
      } else {
        setMessage(`❌ Error: ${data.message || "Failed to add product"}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Add New Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              required
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              required
            />
          </div>

          {/* Brand & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="brand"
              placeholder="Brand (e.g., Nike, Levi’s)"
              value={formData.brand}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
            <input
              type="text"
              name="type"
              placeholder="Type (e.g., T-Shirt, Jeans)"
              value={formData.type}
              onChange={handleChange}
              className="border rounded p-2 w-full"
            />
          </div>

          {/* Category (Radio Buttons) */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Category:</label>
            <div className="flex gap-6">
              {["Men", "Women", "Kids"].map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={formData.category === cat}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#fd7f20] focus:ring-[#fd7f20]"
                  />
                  <span className="text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Subcategory:</label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              className="border rounded p-2 w-full bg-white"
              required
            >
              <option value="">Select Subcategory</option>
              <option value="T-Shirts">T-Shirts</option>
              <option value="Shirts">Shirts</option>
              <option value="Jeans">Jeans</option>
              <option value="Shorts">Shorts</option>
              <option value="Dresses">Dresses</option>
              <option value="Jackets">Jackets</option>
            </select>
          </div>

          {/* Description */}
          <textarea
            name="description"
            placeholder="Product Description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="border rounded p-2 w-full"
            required
          />

          {/* Bestseller */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="bestSeller"
              checked={formData.bestSeller}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-gray-700">Mark as Best Seller</label>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {["image1", "image2", "image3", "image4"].map((img) => (
              <label
                key={img}
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-32 cursor-pointer hover:border-[#fd7f20] transition"
              >
                <IoCloudUploadOutline size={32} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  {images[img]?.name || "Upload Image"}
                </span>
                <input
                  type="file"
                  name={img}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required={!images[img]}
                />
                {images[img] && (
                  <img
                    src={URL.createObjectURL(images[img])}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded mt-1"
                  />
                )}
              </label>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fd7f20] text-white py-2 rounded-md hover:bg-[#e96d15] transition mt-6"
          >
            {loading ? "Uploading..." : "Add Product"}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Add;
