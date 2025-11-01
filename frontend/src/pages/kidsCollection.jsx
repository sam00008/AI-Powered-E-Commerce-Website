import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import ProductCard from "../component/ProductCard.jsx";
import CategoryTile from "../component/CategoryTile.jsx";
import Nav from "../component/Navi.jsx";
import Footer from "../component/Footer.jsx";

const PRODUCTS_PER_LOAD = 10;

const KidsCollection = () => {
  const { products, addToCart, currency } = useContext(ShopDataContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(PRODUCTS_PER_LOAD);

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // ✅ Filter only kids’ products
  const kidsProducts = products.filter(
    (p) => p.category?.toLowerCase() === "kids"
  );

  // ✅ Apply search term
  const filteredProducts = kidsProducts.filter((p) =>
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
              placeholder="Search for kids’ products..."
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
                "url('https://i.pinimg.com/736x/72/13/8f/72138f9ecf0c956395a60fd02570a250.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">KIDS’ COLLECTION</h1>
            <p className="text-lg md:text-xl mb-8">
              TRENDY, COMFY, AND COLORFUL OUTFITS FOR LITTLE STARS
            </p>
            <button
              onClick={() => navigate("/category/kids")}
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
                title="Tops"
                image="https://d1csarkz8obe9u.cloudfront.net/posterpreviews/kids-fashion-limited-time-sale-banner-design-template-bf52bcf63371f6006a98e226335a3109_screen.jpg?ts=1608128068"
                aspect="aspect-[4/3]"
                onClick={() => navigate("/category/kids-tops")}
              />
            </div>
            <div>
              <CategoryTile
                title="Jeans"
                image="https://d3jbu7vaxvlagf.cloudfront.net/small/v2/category_media/16242558774155_Daily_19_kidsclothes_176_square.jpg"
                aspect="aspect-[4/4]"
                onClick={() => navigate("/category/kids-jeans")}
              />
            </div>
            <div>
              <CategoryTile
                title="Sets"
                image="https://essa.in/cdn/shop/files/Fit-Jr-Print-Brief-OE-mirage_1800x1800.jpg?v=1718082798"
                aspect="aspect-[3/4]"
                onClick={() => navigate("/category/kids-sets")}
              />
            </div>
          </div>
        </section>

        {/* ✅ Kids’ Collection Grid */}
        <section className="bg-gray-50/70 text-black">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">Kids’ New Arrivals</h2>
            </div>

            {productsToDisplay.length === 0 ? (
              <p className="text-center py-10">
                No kids’ products found matching your criteria.
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

export default KidsCollection;
