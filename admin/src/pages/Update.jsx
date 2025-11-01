// src/pages/Update.jsx
import React, { useEffect, useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Update() {
  const { id } = useParams(); // Get product ID from route
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    bestseller: false,
    sizes: "",
  });

  const [images, setImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [existingImages, setExistingImages] = useState({
    image1: "",
    image2: "",
    image3: "",
    image4: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch product details on mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/product/admin/list`);
        const product = res.data.data.find((p) => p._id === id);

        if (!product) {
          setMessage("Product not found");
          return;
        }

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          subCategory: product.subCategory,
          bestseller: product.bestseller,
          sizes: product.sizes,
        });

        setExistingImages({
          image1: product.image1,
          image2: product.image2,
          image3: product.image3,
          image4: product.image4,
        });
      } catch (err) {
        console.error(err);
        setMessage("Failed to load product");
      }
    };
    fetchProduct();
  }, [id]);

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

      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

      // Only append images if admin uploaded new ones
      Object.entries(images).forEach(([key, file]) => {
        if (file) form.append(key, file);
      });

      const res = await axios.put(
        `http://localhost:3000/api/product/product/${id}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );

      if (res.status === 200) {
        setMessage("✅ Product updated successfully!");
        setTimeout(() => navigate("/lists"), 1000); // Redirect to list page
      } else {
        setMessage("❌ Failed to update product");
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
          Update Product
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

          {/* Category */}
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
            <label className="block text-gray-700 mb-2 font-medium">Sub Category:</label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              className="border rounded p-2 w-full bg-white"
              required
            >
              <option value="">Select</option>
              <option value="Topwear">Topwear</option>
              <option value="Lowerwear">Lowerwear</option>
              <option value="Underwear">Underwear</option>
            </select>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Available Size:</label>
            <div className="flex flex-wrap gap-4">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <label key={size} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="sizes"
                    value={size}
                    checked={formData.sizes === size}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#fd7f20] focus:ring-[#fd7f20]"
                  />
                  <span className="text-gray-700">{size}</span>
                </label>
              ))}
            </div>
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
              name="bestseller"
              checked={formData.bestseller}
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
                  {images[img]?.name || existingImages[img]?.split("/").pop() || "Upload Image"}
                </span>
                <input
                  type="file"
                  name={img}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {(images[img] || existingImages[img]) && (
                  <img
                    src={images[img] ? URL.createObjectURL(images[img]) : existingImages[img]}
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
            {loading ? "Updating..." : "Update Product"}
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

export default Update;
