// ProductDetailPage.jsx (Final Updated with Recommendation System)

import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import { authDataContext } from "../context/authContext.jsx"; 
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import Nav from "../component/Navi.jsx";
import Footer from "../component/Footer.jsx";

// 🔥 NEW IMPORTS
import useRecommendations from "../hooks/useRecommendation.js";
import RecommendationSection from "../component/RecommendationComponent.jsx"

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCartData, currency } = useContext(ShopDataContext);
  const { user } = useContext(authDataContext); 

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [wishlist, setWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  const API_BASE_URL = "ai-powered-e-commerce-website-backend-j6vz.onrender.com/api";
  const apiUrl = `${API_BASE_URL}/product/category/${id}`;

  // 🔥 RECOMMENDATION HOOKS
  const { data: similarProducts, loading: similarLoading } = useRecommendations({
    type: "similar",
    productId: id,
  });

  const { data: frequentlyBought, loading: freqLoading } = useRecommendations({
    type: "frequently",
    productId: id,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl);
        const data = await res.json();
        const prod = Array.isArray(data.data) ? data.data[0] : data.data;
        setProduct(prod);
        setSelectedImage(prod?.image1 || prod?.images?.[0] || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, apiUrl]);

  const handleAddToCart = async () => {
    try {
      setCartLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart/addcart`, {
        method: "POST",
        credentials: "include", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Product added to cart successfully!");
        await getCartData(); 
        return true; 
      } else {
        alert(data.message || "Failed to add to cart");
        if (response.status === 401) {
          navigate("/login");
        }
        return false; 
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Something went wrong while adding to cart.");
      return false; 
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      navigate("/checkout");
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!product) return <div className="flex justify-center items-center h-screen text-red-600">Product not found.</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Nav />
      
      <main className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* LEFT SIDE */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-3">
            {[product.image1, product.image2, product.image3].filter(Boolean).map((img, idx) => (
              <div
                key={idx}
                className={`border-2 rounded-xl p-1 cursor-pointer ${selectedImage === img ? "border-pink-500 scale-105" : "border-gray-200 hover:border-pink-400"}`}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt={`Thumbnail ${idx}`} className="w-20 h-20 object-contain rounded-lg" />
              </div>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-200 relative flex items-center justify-center">
            <img src={selectedImage} alt={product.name} className="w-full h-[550px] object-contain hover:scale-105 transition" />
            <button
              className="absolute top-4 right-4 bg-white/80 p-3 rounded-full shadow-md"
              onClick={() => setWishlist(!wishlist)}
            >
              {wishlist ? <FaHeart className="text-pink-500" /> : <FaRegHeart />}
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white p-8 rounded-3xl shadow-md space-y-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl">{currency}{product.price}</p>

          {/* ACTION */}
          <div className="flex gap-4">
            <button 
              onClick={handleAddToCart} 
              disabled={cartLoading}
              className="bg-pink-500 text-white px-6 py-3 rounded-xl"
            >
              {cartLoading ? "ADDING..." : "Add to Cart"}
            </button>

            <button 
              onClick={handleBuyNow}
              disabled={cartLoading}
              className="border px-6 py-3 rounded-xl"
            >
              Buy Now
            </button>
          </div>

          <p>{product.description}</p>
        </div>
      </main>

      {/* OLD STATIC SECTION */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Customers also purchased</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {product.related?.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-md">
              <img src={item.image} alt={item.name} className="w-full h-40 object-contain" />
              <h3 className="mt-2 font-semibold">{item.name}</h3>
              <p>{currency}{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔥 NEW AI RECOMMENDATION SECTION */}
      <section className="container mx-auto px-4 py-12">
        <RecommendationSection
          title="🔥 Frequently Bought Together"
          products={frequentlyBought}
          loading={freqLoading}
        />

        <RecommendationSection
          title="🧠 Similar Products"
          products={similarProducts}
          loading={similarLoading}
        />
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;