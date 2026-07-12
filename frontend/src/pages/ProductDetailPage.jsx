import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import { authDataContext } from "../context/authContext.jsx"; 
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Nav from "../component/Navi.jsx";
import Footer from "../component/Footer.jsx";

import useRecommendations from "../hooks/useRecommendation.js";
import RecommendationSection from "../component/RecommendationComponent.jsx"; // Ensure correct path

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCartData, currency } = useContext(ShopDataContext);
  const { user } = useContext(authDataContext); 

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [wishlist, setWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  const API_BASE_URL = "https://ai-powered-e-commerce-website-backend-j6vz.onrender.com/api";
  const apiUrl = `${API_BASE_URL}/product/category/${id}`;

  // RECOMMENDATION HOOKS
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
    if (id) fetchProduct();
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

  // FIX: Failsafe extraction in case the hook returns the nested ApiResponse object
  const safeSimilarProducts = Array.isArray(similarProducts) ? similarProducts : similarProducts?.data || [];
  const safeFrequentProducts = Array.isArray(frequentlyBought) ? frequentlyBought : frequentlyBought?.data || [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <Nav />
      
      <main className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* LEFT SIDE - Images */}
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

          <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-200 relative flex items-center justify-center overflow-hidden">
            <img src={selectedImage} alt={product.name} className="w-full h-[550px] object-contain hover:scale-105 transition duration-300" />
            <button
              className="absolute top-4 right-4 bg-white/80 p-3 rounded-full shadow-md hover:bg-pink-50 transition"
              onClick={() => setWishlist(!wishlist)}
            >
              {wishlist ? <FaHeart className="text-pink-500 text-xl" /> : <FaRegHeart className="text-xl" />}
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - Info */}
        <div className="bg-white p-8 rounded-3xl shadow-md space-y-6">
          <h1 className="text-4xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-3xl font-semibold text-pink-600">{currency}{product.price}</p>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={handleAddToCart} 
              disabled={cartLoading}
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-8 py-4 rounded-xl transition shadow-lg disabled:opacity-70"
            >
              {cartLoading ? "ADDING..." : "Add to Cart"}
            </button>

            <button 
              onClick={handleBuyNow}
              disabled={cartLoading}
              className="border-2 border-gray-800 hover:bg-gray-800 hover:text-white font-semibold px-8 py-4 rounded-xl transition disabled:opacity-70"
            >
              Buy Now
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </main>

      {/* AI RECOMMENDATION SECTION */}
      <section className="container mx-auto px-4 py-12 border-t border-gray-200">
        <RecommendationSection
          title=" Frequently Bought Together"
          products={safeFrequentProducts}
          loading={freqLoading}
        />

        <RecommendationSection
          title="Similar Products"
          products={safeSimilarProducts}
          loading={similarLoading}
        />
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;