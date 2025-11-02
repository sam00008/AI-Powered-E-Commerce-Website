import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import ProductCard from "../component/ProductCard.jsx";
import CategoryTile from "../component/CategoryTile.jsx";
import Nav from "../component/Navi.jsx";
import Footer from "../component/Footer.jsx";

const PRODUCTS_PER_LOAD = 10;

const ShirtCollection = () => {
  const { addToCart, currency } = useContext(ShopDataContext);
  const [shirts, setShirts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(PRODUCTS_PER_LOAD);

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // ✅ Fetch only men & women shirts (not t-shirts)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://ai-powered-e-commerce-website-backend-j6vz.onrender.com/api/product/admin/list");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        // ✅ Filter logic:
        // Include if it contains "shirt"
        // Exclude if it contains "t-shirt", "tshirt", or "tee"
        const filteredShirts = (data?.data || data || []).filter((p) => {
          const name = p?.name?.toLowerCase() || "";
          const category = p?.category?.toLowerCase() || "";
          const subCategory = p?.subCategory?.toLowerCase() || "";

          const isShirt =
            (name.includes("shirt") || subCategory.includes("shirt")) &&
            !name.includes("t-shirt") &&
            !name.includes("tshirt") &&
            !name.includes("tee");

          const isMenOrWomen =
            category.includes("men") || category.includes("women");

          return isShirt && isMenOrWomen;
        });

        console.log("✅ Shirts found:", filteredShirts);
        setShirts(filteredShirts);
      } catch (err) {
        console.error("❌ Error fetching shirts:", err);
        setError("Unable to load shirt products right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Apply search filter
  const filteredProducts = shirts.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productsToDisplay = filteredProducts.slice(0, displayLimit);
  const showLoadMoreButton = productsToDisplay.length < filteredProducts.length;

  const handleLoadMore = () => setDisplayLimit((prev) => prev + PRODUCTS_PER_LOAD);

  // ✅ Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const onProtectedClick = (path) => {
    navigate(path);
    setSearchOpen(false);
  };

  // ✅ Loading / error states
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        <p className="text-lg font-medium">Loading shirts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600">
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white font-sans">
      {/* Navbar */}
      <Nav
        onProtectedClick={onProtectedClick}
        onSearchClick={() => setSearchOpen(!searchOpen)}
      />

      {/* Search Bar */}
      {searchOpen && (
        <div className="container mx-auto px-4 py-3" ref={searchRef}>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 w-full focus-within:ring-2 focus-within:ring-blue-500 transition">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDisplayLimit(PRODUCTS_PER_LOAD);
              }}
              placeholder="Search for shirts..."
              className="bg-transparent outline-none w-full text-gray-700"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="mt-16 md:mt-14">
        {/* ✅ Hero Section */}
        <section className="relative w-full h-[90vh] flex items-center justify-center text-center text-white">
          <div
            className="absolute inset-0 bg-cover bg-center brightness-75"
            style={{
              backgroundImage:
                "url('https://media-cldnry.s-nbcnews.com/image/upload/t_social_share_1024x768_scale,f_auto,q_auto:best/newscms/2020_30/3399189/everlane-sale-kr-2x1-tease-200723.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">SHIRT COLLECTION</h1>
            <p className="text-lg md:text-xl mb-8">
              CLASSIC, CASUAL & FORMAL SHIRTS FOR EVERY STYLE
            </p>
            <button
              onClick={() => navigate("/category/shirts")}
              className="px-8 py-3 bg-[#F06C0F] hover:bg-[#e55f0d] transition rounded-lg text-white font-semibold"
            >
              SHOP NOW
            </button>
          </div>
        </section>

        {/* ✅ Shop by Category */}
        <section className="container mx-auto px-4 py-16 bg-white text-black">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <CategoryTile
              title="Men’s Shirts"
              image="https://campussutra.com/cdn/shop/files/CSMSSRT9365_1_8775e4d7-9443-49e0-a538-28f60e6423b7.jpg?v=1761722196&width=2000"
              aspect="aspect-[3/4]"
              onClick={() => navigate("/category/men-shirts")}
            />
            <CategoryTile
              title="Women’s Shirts"
              image="https://i.pinimg.com/736x/4a/45/46/4a4546444ad7ab0a1a6557144d91258d.jpg"
              aspect="aspect-[3/4]"
              onClick={() => navigate("/category/women-shirts")}
            />
            <CategoryTile
              title="Casual & Formal"
              image="https://i.mdel.net/i/db/2025/1/2412916/2412916-800w.jpg"
              aspect="aspect-[3/4]"
              onClick={() => navigate("/category/casual-formal")}
            />
          </div>
        </section>

        {/* ✅ Shirts Grid */}
        <section className="bg-gray-50/70 text-black">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">New Arrivals</h2>
            </div>

            {productsToDisplay.length === 0 ? (
              <p className="text-center py-10">
                No shirts found matching your criteria.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {productsToDisplay.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    addToCart={addToCart}
                    currency={currency}
                    btnColor="bg-[#F06C0F] hover:bg-[#e55f0d]"
                  />
                ))}
              </div>
            )}

            {showLoadMoreButton && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-lg border-2 border-[#F06C0F] text-[#F06C0F] font-semibold hover:bg-[#F06C0F] hover:text-white transition-colors duration-300"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ShirtCollection;
