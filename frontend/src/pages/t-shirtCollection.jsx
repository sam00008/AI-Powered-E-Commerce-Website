import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import ProductCard from "../component/ProductCard.jsx";
import CategoryTile from "../component/CategoryTile.jsx";
import Nav from "../component/Navi.jsx";
import Footer from "../component/Footer.jsx";

const PRODUCTS_PER_LOAD = 10;

const TshirtCollection = () => {
  const { addToCart, currency } = useContext(ShopDataContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(PRODUCTS_PER_LOAD);
  const [tshirtProducts, setTshirtProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // ✅ Fetch only T-Shirt products (for Men & Women)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/product/admin/list");
        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();

        // ✅ Filter only "t-shirt" items (exclude "shirt")
        const tshirts = (data?.data || data || []).filter(
          (p) =>
            p?.subCategory?.toLowerCase().includes("t-shirt") &&
            !p?.subCategory?.toLowerCase().includes("shirt") &&
            (p?.category?.toLowerCase().includes("men") ||
              p?.category?.toLowerCase().includes("women"))
        );

        console.log("T-Shirt products found:", tshirts);
        setTshirtProducts(tshirts);
      } catch (err) {
        console.error("Error fetching T-Shirt products:", err);
        setError("Unable to load T-Shirt products right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Apply search filter
  const filteredProducts = tshirtProducts.filter((p) =>
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
              placeholder="Search for T-Shirts..."
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
                "url('https://image.uniqlo.com/UQ/ST3/jp/imagesother/summer-mood/23ss/gl/img/hero-desktop.jpg?20230306')",
            }}
          ></div>
          <div className="absolute inset-0 bg-black/40"></div>

          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">T-SHIRT COLLECTION</h1>
            <p className="text-lg md:text-xl mb-8">
              CLASSIC, COOL, AND CASUAL TEES FOR MEN & WOMEN
            </p>
            <button
              onClick={() => navigate("/category/tshirts")}
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
                title="Men's T-Shirts"
                image="https://campussutra.com/cdn/shop/files/CSMOVSRT7609_3_52eadbc3-3c06-4480-abda-47bf3a54c0dd.jpg?v=1730801146&width=2000"
                aspect="aspect-[6/6]"
                onClick={() => navigate("/category/men-tshirt")}
              />
            </div>
            <div>
              <CategoryTile
                title="Women's T-Shirts"
                image="https://m.media-amazon.com/images/I/510kOh+f0AL._SY550_.jpg"
                aspect="aspect-[3/4]"
                onClick={() => navigate("/category/women-tshirt")}
              />
            </div>
            <div>
              <CategoryTile
                title="Holiday's T-Shirt"
                image="https://image.uniqlo.com/UQ/ST3/jp/imagesother/ready-for-vacation/gl/img/women/kv_sp03.jpg?20220418?20220418"
                aspect="aspect-[3/5]"
                onClick={() => navigate("/category/graphic-tshirt")}
              />
            </div>
          </div>
        </section>

        {/* ✅ T-Shirt Product Grid */}
        <section className="bg-gray-50/70 text-black">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">T-Shirt New Arrivals</h2>
            </div>

            {productsToDisplay.length === 0 ? (
              <p className="text-center py-10">
                No T-Shirt products found matching your criteria.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {productsToDisplay.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    addToCart={addToCart}
                    currency={currency}
                    btnColor="bg-[#1E3A8A] hover:bg-[#1c3380]"
                  />
                ))}
              </div>
            )}

            {showLoadMoreButton && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-lg border-2 border-[#1E3A8A] text-[#1E3A8A] font-semibold hover:bg-[#1E3A8A] hover:text-white transition-colors duration-300"
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

export default TshirtCollection;
