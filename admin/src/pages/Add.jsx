// src/pages/Add.jsx (Updated for Recommendation System)

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
    gender: "",
    color: "",
    material: "",
    tags: "",
    keywords: "",
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    setImages((prev) => ({
      ...prev,
      [name]: files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const form = new FormData();

      // ✅ Convert tags & keywords to array
      const updatedData = {
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()),
        keywords: formData.keywords.split(",").map((k) => k.trim()),
      };

      Object.entries(updatedData).forEach(([key, value]) => {
        form.append(key, value);
      });

      Object.entries(images).forEach(([key, file]) => {
        form.append(key, file);
      });

      const res = await fetch(
        "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com/api/product/addproduct",
        {
          method: "POST",
          body: form,
          credentials: "include",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Product added successfully!");
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-100 min-h-screen px-4">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Add Product (AI Ready)
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* BASIC */}
          <input name="name" placeholder="Product Name" onChange={handleChange} className="border p-2 w-full" />
          <input name="price" placeholder="Price" onChange={handleChange} className="border p-2 w-full" />

          {/* NEW FIELDS */}
          <input name="brand" placeholder="Brand" onChange={handleChange} className="border p-2 w-full" />
          <input name="type" placeholder="Type (T-shirt, Jeans)" onChange={handleChange} className="border p-2 w-full" />

          <input name="color" placeholder="Color (black, red)" onChange={handleChange} className="border p-2 w-full" />
          <input name="material" placeholder="Material (cotton, denim)" onChange={handleChange} className="border p-2 w-full" />

          <input name="gender" placeholder="Gender (men/women)" onChange={handleChange} className="border p-2 w-full" />

          {/* 🔥 IMPORTANT FOR AI */}
          <input
            name="tags"
            placeholder="Tags (comma separated: casual, summer, party)"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <input
            name="keywords"
            placeholder="Keywords (nike, tshirt, black)"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="border p-2 w-full"
          />

          {/* IMAGES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["image1", "image2", "image3", "image4"].map((img) => (
              <input key={img} type="file" name={img} onChange={handleImageChange} />
            ))}
          </div>

          <button className="bg-orange-500 text-white p-2 w-full">
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}

export default Add;