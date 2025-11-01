import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ import navigate

function Lists() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // ✅ initialize navigate

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/product/admin/list");
        setProducts(res.data.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("⚠️ Could not fetch products. Check backend on port 3000.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/product/product/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  const handleEdit = (id) => {
    navigate(`/update/${id}`); // ✅ navigate to Update page
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
                    <img src={p.image1} alt={p.name} className="w-14 h-14 object-cover rounded" />
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
                      onClick={() => handleEdit(p._id)} // ✅ navigate instead of prompt
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
