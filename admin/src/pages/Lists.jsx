import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

// 🔹 Base URL setup
const BASE_URL = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com";

function Lists() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // ✅ FETCH ROUTE: This path is correct: /api/product/admin/list
        const res = await axios.get(`${BASE_URL}/api/product/admin/list`, {
          withCredentials: true,
        });
        setProducts(res.data.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        // If this fails, it's likely a 401 (unauthorized/no JWT) or the CORS fix failed.
        setError("⚠️ Could not fetch products. Check backend security or CORS config.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      // ❌ PROBLEM FIX: Removed the redundant "/product" from the path. 
      // Corrected Backend path is: /api/product/:id
      await axios.delete(`${BASE_URL}/api/product/${id}`, { 
        withCredentials: true,
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      // The error is likely a 401 or 403 because you added verifyjwt to the backend.
      alert("Failed to delete product. Are you logged in as Admin?");
    }
  };

  const handleEdit = (id) => {
    // 💡 POTENTIAL FIX: The backend uses /api/product/get/:id for details (if you implemented the suggested change). 
    // The update form needs to fetch data first, so the path should be correct for that.
    // Assuming your update form loads data using the /get/:id route:
    navigate(`/update/${id}`); // This path is for the client-side router (e.g., /update/123)
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Product List</h1>

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">Image</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">SubCategory</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <img
                      src={p.image1}
                      alt={p.name}
                      className="w-14 h-14 object-cover rounded"
                    />
                  </td>
                  <td className="py-3 px-4">{p.name}</td>
                  <td className="py-3 px-4">₹{p.price}</td>
                  <td className="py-3 px-4">{p.category}</td>
                  <td className="py-3 px-4">{p.subCategory}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(p._id)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Lists;