import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import ProductCard from "../component/ProductCard.jsx";
import Nav from "../component/Navi.jsx";
import Footer from "../component/Footer.jsx";

const PRODUCTS_PER_LOAD = 10;

const JeansCollection = () => {
  const { addToCart, currency } = useContext(ShopDataContext);
  const [jeansProducts, setJeansProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(PRODUCTS_PER_LOAD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // ✅ Fetch all products and filter jeans (men + women)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://ai-powered-e-commerce-website-backend-j6vz.onrender.com/api/product/admin/list");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        // ✅ Filter jeans for both men & women based on category + subCategory
        const jeans = (data?.data || data || []).filter(
          (p) =>
            p?.subCategory?.toLowerCase().includes("jean") &&
            (p?.category?.toLowerCase().includes("men") ||
              p?.category?.toLowerCase().includes("women"))
        );

        console.log("Jeans products found:", jeans);
        setJeansProducts(jeans);
      } catch (err) {
        console.error("Error fetching jeans products:", err);
        setError("Unable to load jeans products right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Apply search filter
  const filteredProducts = jeansProducts.filter((p) =>
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
              placeholder="Search jeans..."
              className="bg-transparent outline-none w-full text-gray-700"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="mt-16 md:mt-14">
        {/* ✅ Hero Section */}
        <section className="relative w-full h-[90vh] flex items-center justify-center text-center text-white">
          {/* Background image with dim overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center brightness-75"
            style={{
              backgroundImage:
                "url('https://media.lee.com/i/lee/LEE_SS21_HP1_DT_banner_group_1920x672px?&w=1440&qlt=80')",
            }}
          ></div>
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Overlay text */}
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              JEANS COLLECTION
            </h1>
            <p className="text-lg md:text-xl mb-8">
              FIND YOUR PERFECT FIT — DENIM FOR EVERY STYLE
            </p>
            <button
              onClick={() => navigate("/category/jeans")}
              className="px-8 py-3 bg-[#F06C0F] hover:bg-[#e55f0d] transition rounded-lg text-white font-semibold"
            >
              SHOP NOW
            </button>
          </div>
        </section>

        {/* ✅ Jeans Collection Grid */}
        <section className="bg-gray-50/70 text-black">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">New in Jeans</h2>
            </div>

            {loading ? (
              <p className="text-center py-10 text-gray-600">
                Loading jeans...
              </p>
            ) : error ? (
              <p className="text-center py-10 text-red-500">{error}</p>
            ) : productsToDisplay.length === 0 ? (
              <p className="text-center py-10">
                No jeans found matching your criteria.
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

export default JeansCollection;
