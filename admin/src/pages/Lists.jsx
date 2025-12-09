import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Trash2, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authDataContext } from "../context/AuthProvider"; // 👈 Import the context

function Lists() {
    // 1. Get Authentication State from Context
    const { 
        serverUrl, 
        loading: authLoading, // Global loading state from AuthProvider
        adminData 
    } = useContext(authDataContext); 
    
    const [products, setProducts] = useState([]);
    const [componentLoading, setComponentLoading] = useState(true); // Local loading for the fetch operation
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        // ⚠️ Conditional Fetching Logic: Wait for AuthProvider to finish checking status.
        if (authLoading) {
            // Still checking authentication, wait.
            return;
        }

        // If AuthProvider is done loading and adminData is null, stop and show error
        if (!adminData) {
            setComponentLoading(false);
            setError("❌ Access Denied. Please ensure you are logged in as an Admin.");
            return;
        }

        // --- Authentication Confirmed (adminData is present) - Proceed to Fetch ---
        const fetchProducts = async () => {
            try {
                // Use serverUrl from context
                const res = await axios.get(`${serverUrl}/api/product/admin/list`, {
                    withCredentials: true,
                });
                setProducts(res.data.data);
                setError(""); // Clear previous errors on success
            } catch (err) {
                console.error("Error fetching products:", err);
                // Specific error handling for clarity
                const status = err.response?.status;
                if (status === 401 || status === 403) {
                    setError("🚫 Session expired or unauthorized access. Please log in again.");
                } else {
                    setError("⚠️ Could not fetch products. Check the backend server status.");
                }
            } finally {
                setComponentLoading(false);
            }
        };
        
        fetchProducts();
    }, [authLoading, adminData, serverUrl]); // Re-run only when these dependencies change

    // --- Action Handlers ---

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            // Use serverUrl from context and the correct path: /api/product/:id
            await axios.delete(`${serverUrl}/api/product/${id}`, { 
                withCredentials: true,
            });
            setProducts((prev) => prev.filter((p) => p._id !== id));
            alert("Product deleted successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to delete product. Check console for details.");
        }
    };

    const handleEdit = (id) => {
        // Navigate to the Update route
        navigate(`/update/${id}`); 
    };

    // --- Component Render ---

    // Prioritize the AuthProvider's loading state
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Checking admin authorization...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6">Product List</h1>

            {componentLoading ? (
                <p>Loading products...</p>
            ) : error ? (
                <p className="text-red-500 font-semibold text-lg p-4 bg-red-100 border border-red-400 rounded-lg">{error}</p>
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