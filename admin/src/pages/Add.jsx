// src/pages/Add.jsx (FINAL STABLE VERSION)

import React, { useState } from "react";

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

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // HANDLE IMAGE
  // =========================
  const handleImageChange = (e) => {
    const { name, files } = e.target;

    if (!files || !files[0]) return;

    setImages((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // ✅ Validate required fields
      const required = ["name", "description", "price", "category", "subCategory"];
      for (let field of required) {
        if (!formData[field]) {
          setMessage(`❌ Please fill ${field}`);
          setLoading(false);
          return;
        }
      }

      // ✅ Validate images
      for (let img of ["image1", "image2", "image3", "image4"]) {
        if (!images[img]) {
          setMessage(`❌ Please upload ${img}`);
          setLoading(false);
          return;
        }
      }

      // ✅ Create FormData
      const form = new FormData();

      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      // Append images
      Object.entries(images).forEach(([key, file]) => {
        form.append(key, file);
      });

      // ✅ DEBUG (VERY IMPORTANT)
      for (let [key, value] of form.entries()) {
        console.log(key, value);
      }

      // =========================
      // API CALL
      // =========================
      const res = await fetch(
        "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com/api/product/addproduct",
        {
          method: "POST",
          body: form,
          credentials: "include",
        }
      );

      // ✅ HANDLE RAW RESPONSE (FIXES '<!DOCTYPE' ERROR)
      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server returned HTML instead of JSON");
      }

      if (res.ok) {
        setMessage("✅ Product added successfully!");

        // Reset form
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

        setImages({
          image1: null,
          image2: null,
          image3: null,
          image4: null,
        });

      } else {
        setMessage(`❌ ${data.message || "Failed to add product"}`);
      }

    } catch (err) {
      console.error("ERROR:", err);
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl">

        <h2 className="text-2xl font-semibold mb-6 text-center">
          Add Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name & Price */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              className="border p-2"
            />
            <input
              name="price"
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              className="border p-2"
            />
          </div>

          {/* Brand & Type */}
          <div className="grid grid-cols-2 gap-4">
            <input
              name="brand"
              placeholder="Brand"
              value={formData.brand}
              onChange={handleChange}
              className="border p-2"
            />
            <input
              name="type"
              placeholder="Type (T-shirt, Jeans)"
              value={formData.type}
              onChange={handleChange}
              className="border p-2"
            />
          </div>

          {/* Category */}
          <input
            name="category"
            placeholder="Category (Men/Women/Kids)"
            value={formData.category}
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            name="subCategory"
            placeholder="Subcategory (T-Shirts, Jeans)"
            value={formData.subCategory}
            onChange={handleChange}
            className="border p-2 w-full"
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="border p-2 w-full"
          />

          {/* Bestseller */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="bestSeller"
              checked={formData.bestSeller}
              onChange={handleChange}
            />
            Bestseller
          </label>

          {/* Images */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["image1", "image2", "image3", "image4"].map((img) => (
              <input
                key={img}
                type="file"
                name={img}
                accept="image/*"
                onChange={handleImageChange}
              />
            ))}
          </div>

          <button className="bg-orange-500 text-white p-2 w-full">
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}

export default Add;