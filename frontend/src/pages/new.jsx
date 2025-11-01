import React, { useEffect, useState, useMemo, useContext } from "react";
import axios from "axios";
import { ShopDataContext } from "../context/ShopContext";
import { useNavigate } from "react-router-dom";
import ProductCard from "../component/ProductCard.jsx";
import Nav from "../component/Navi.jsx";

function NewArrivals() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart, currency, cart } = useContext(ShopDataContext);
  const navigate = useNavigate();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/product/admin/list"
        );
        setProducts(res.data.data || res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("⚠️ Could not fetch products. Check backend on port 3000.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter latest products by category
  const latestProducts = useMemo(() => {
    const sorted = [...products].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      men: sorted.filter((p) => p.category.toLowerCase() === "men").slice(0, 6),
      women: sorted.filter((p) => p.category.toLowerCase() === "women").slice(0, 6),
      kids: sorted.filter((p) => p.category.toLowerCase() === "kids").slice(0, 6),
    };
  }, [products]);

  if (loading) return <p className="text-center mt-10">Loading products...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (products.length === 0) return <p className="text-center mt-10">No products found.</p>;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <Nav/>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-center my-10 text-gray-800">
         New Arrivals
      </h1>

      {/* Men Collection */}
      <section className="mb-12">
        <h2
          className="text-2xl font-semibold mb-4 text-gray-700 border-l-4 border-black pl-3 cursor-pointer hover:text-black"
          onClick={() => navigate("/category/men")}
        >
          Men’s Collection
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {latestProducts.men.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              currency={currency}
              addToCart={addToCart}
              btnColor="bg-black hover:bg-gray-800"
            />
          ))}
        </div>
      </section>

      {/* Women Collection */}
      <section className="mb-12">
        <h2
          className="text-2xl font-semibold mb-4 text-gray-700 border-l-4 border-pink-500 pl-3 cursor-pointer hover:text-pink-500"
          onClick={() => navigate("/category/women")}
        >
          Women’s Collection
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {latestProducts.women.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              currency={currency}
              addToCart={addToCart}
              btnColor="bg-pink-500 hover:bg-pink-600"
            />
          ))}
        </div>
      </section>

      {/* Kids Collection */}
      <section>
        <h2
          className="text-2xl font-semibold mb-4 text-gray-700 border-l-4 border-blue-500 pl-3 cursor-pointer hover:text-blue-500"
          onClick={() => navigate("/category/kids")}
        >
          Kids’ Collection
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {latestProducts.kids.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              currency={currency}
              addToCart={addToCart}
              btnColor="bg-blue-500 hover:bg-blue-600"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default NewArrivals;
