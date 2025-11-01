// ProductDetailPage.jsx (Corrected)
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import { authDataContext } from "../context/authContext.jsx"; 
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import Nav from "../component/Navi.jsx";
import Footer from "../component/Footer.jsx";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCartData, currency } = useContext(ShopDataContext);
  
  // We keep this import in case you want to use the user object elsewhere
  const { user } = useContext(authDataContext); 

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [wishlist, setWishlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  const API_BASE_URL = "http://localhost:3000/api";
  const apiUrl = `${API_BASE_URL}/product/category/${id}`;

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
    // 🛑 REMOVED THIS BLOCK 🛑
    // if (!user) { 
    //   alert("Please log in to add items to your cart.");
    //   navigate("/login");
    //   return false; 
    // }
    // 🛑 END OF REMOVAL 🛑

    try {
      setCartLoading(true);
      // Now we just try the request. The backend will reject it if not logged in.
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
        // ✅ This part is perfect and will catch the 401 (Not Logged In) error
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
        {/* Left: Image Gallery */}
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

          <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden relative flex items-center justify-center">
            <img src={selectedImage} alt={product.name} className="w-full h-[550px] object-contain transition-transform duration-500 hover:scale-105" />
            <button
              className="absolute top-4 right-4 bg-white/80 p-3 rounded-full shadow-md"
              onClick={() => setWishlist(!wishlist)}
            >
              {wishlist ? <FaHeart className="text-pink-500" /> : <FaRegHeart />}
            </button>
          </div>
        </div>

        {/* Right: Info Section */}
        <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100 space-y-6">
          <div>
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <p className="text-2xl mt-2">{currency}{product.price}</p>
          </div>

          {/* Color Picker */}
          <div>
            <h2 className="font-semibold">Color</h2>
            <div className="flex gap-2 mt-2">
              {["black", "heather-grey"].map((color) => (
                <div
                  key={color}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${selectedColor === color ? "border-pink-500" : "border-gray-200"}`}
                  style={{ backgroundColor: color === "black" ? "#000" : "#ccc" }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Size Picker */}
          <div>
            <h2 className="font-semibold">Size</h2>
            <div className="flex gap-2 mt-2">
              {["XXS", "XS", "S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  disabled={size === "XL"}
                  className={`px-4 py-2 border rounded-lg ${selectedSize === size ? "border-pink-500" : "border-gray-300"} ${size === "XL" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-4">
            <button 
              onClick={handleAddToCart} 
              disabled={cartLoading}
              className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition disabled:opacity-50"
            >
              {cartLoading ? "ADDING..." : "Add to Cart"}
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={cartLoading}
              className="border px-6 py-3 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>

          {/* Product Info */}
          <div>
            <h2 className="font-semibold">Description</h2>
            <p className="mt-2">{product.description}</p>
          </div>
          <div>
            <h2 className="font-semibold">Fabric & Care</h2>
            <ul className="list-disc ml-5 mt-2">
              {product.fabricCare?.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-semibold">Our Policies</h2>
            <ul className="mt-2 list-disc ml-5">
              <li>International delivery</li>
              <li>Loyalty rewards</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Related Products */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Customers also purchased</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {product.related?.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
              <img src={item.image} alt={item.name} className="w-full h-40 object-contain" />
              <h3 className="mt-2 font-semibold">{item.name}</h3>
              <p className="text-gray-500">{item.color}</p>
              <p className="mt-1 font-bold">{currency}{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;