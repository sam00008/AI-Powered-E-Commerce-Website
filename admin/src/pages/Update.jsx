import React, { useEffect, useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Update() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    subCategory: "",
    bestSeller: false, // ✅ FIXED
    sizes: "",
    tags: "", // ✅ NEW
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

  // ✅ FIXED: Fetch SINGLE product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/product/category/${id}`
        );

        const product = res.data.data;

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          subCategory: product.subCategory,
          bestSeller: product.bestSeller,
          sizes: product.sizes,
          tags: product.tags?.join(", ") || "", // ✅ NEW
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
        if (key === "tags") {
          form.append(
            "tags",
            JSON.stringify(value.split(",").map((t) => t.trim()))
          );
        } else {
          form.append(key, value);
        }
      });

      Object.entries(images).forEach(([key, file]) => {
        if (file) form.append(key, file);
      });

      // ✅ FIXED ROUTE
      const res = await axios.put(
        `http://localhost:3000/api/product/${id}`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        setMessage("✅ Product updated successfully!");
        setTimeout(() => navigate("/lists"), 1000);
      } else {
        setMessage("❌ Failed to update product");
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
          Update Product
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME + PRICE */}
          <div className="grid grid-cols-2 gap-4">
            <input name="name" value={formData.name} onChange={handleChange} className="border p-2"/>
            <input name="price" value={formData.price} onChange={handleChange} className="border p-2"/>
          </div>

          {/* TAGS (NEW 🔥) */}
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="tags (comma separated) e.g. tshirt, summer, cotton"
            className="border p-2 w-full"
          />

          {/* BESTSELLER */}
          <label className="flex gap-2">
            <input
              type="checkbox"
              name="bestSeller"
              checked={formData.bestSeller}
              onChange={handleChange}
            />
            Best Seller
          </label>

          {/* SUBMIT */}
          <button className="bg-orange-500 text-white px-4 py-2 rounded">
            {loading ? "Updating..." : "Update"}
          </button>
        </form>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </div>
  );
}

export default Update;