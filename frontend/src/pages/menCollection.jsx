import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import ProductCard from "../component/ProductCard.jsx";
import CategoryTile from "../component/CategoryTile.jsx";
import Nav from "../component/Navi.jsx";
import Footer from "../component/Footer.jsx";

const PRODUCTS_PER_LOAD = 10;

const MenCollection = () => {
  const { products, addToCart, currency } = useContext(ShopDataContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(PRODUCTS_PER_LOAD);

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // ✅ Filter only men's products
  const menProducts = products.filter(
    (p) => p.category?.toLowerCase() === "men"
  );

  // ✅ Apply search term
  const filteredProducts = menProducts.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productsToDisplay = filteredProducts.slice(0, displayLimit);
  const showLoadMoreButton = productsToDisplay.length < filteredProducts.length;

  const handleLoadMore = () => setDisplayLimit((prev) => prev + PRODUCTS_PER_LOAD);

  // ✅ Close search bar when clicking outside
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
              placeholder="Search for men's products..."
              className="bg-transparent outline-none w-full text-gray-700"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="mt-16 md:mt-14">
        {/* ✅ Hero Section with Background Image */}
        <section className="relative w-full h-[90vh] flex items-center justify-center text-center text-white">
          {/* Background image with overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center brightness-75"
            style={{
              backgroundImage:
                "url('https://inc42.com/cdn-cgi/image/quality=75/https://asset.inc42.com/2017/07/Metronaut-flipkart-private-label.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-black/40"></div>

          {/* Text overlay */}
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">MEN’S COLLECTION</h1>
            <p className="text-lg md:text-xl mb-8">
              ELEVATE YOUR STYLE — LATEST FASHION TRENDS
            </p>
            <button
              onClick={() => navigate("/category/men")}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <CategoryTile
                title="Shirts"
                image="https://campussutra.com/cdn/shop/files/CSMSSRT9106_1_983e506a-4ce8-4612-8650-bc7f008b4d18.jpg?v=1761722190&width=2000"
                aspect="aspect-[4/3]"
                onClick={() => navigate("/category/shirts")}
              />
            </div>
            <div>
              <CategoryTile
                title="Jeans"
                image="https://www.urbanofashion.com/cdn/shop/files/Artboard_1_copy_5_3x_f3d7c135-17c6-4937-b690-7ab034f69f61.png?v=1751899678"
                aspect="aspect-[4/4]"
                onClick={() => navigate("/category/jeans")}
              />
            </div>
            <div>
              <CategoryTile
                title="T-Shirts"
                image="https://tigc.in/cdn/shop/files/Frame_1261155265_1_1.webp?v=1758546293"
                aspect="aspect-[3/4]"
                onClick={() => navigate("/category/t-shirts")}
              />
            </div>
          </div>
        </section>

        {/* ✅ Men’s Collection Grid */}
        <section className="bg-gray-50/70 text-black">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Men’s New Arrivals</h2>
            </div>

            {productsToDisplay.length === 0 ? (
              <p className="text-center py-10">
                No men’s products found matching your criteria.
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

export default MenCollection;
