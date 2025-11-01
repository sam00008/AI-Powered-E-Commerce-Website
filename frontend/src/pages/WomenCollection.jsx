import React, { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ShopDataContext } from "../context/ShopContext.jsx";
import ProductCard from "../component/ProductCard.jsx";
import CategoryTile from "../component/CategoryTile.jsx";
import Nav from "../component/Navi.jsx";
import Footer from "../component/Footer.jsx";

const PRODUCTS_PER_LOAD = 10;

const WomenCollection = () => {
  const { products, addToCart, currency } = useContext(ShopDataContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(PRODUCTS_PER_LOAD);

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Filter products by women category
  const womenProducts = products.filter(
    (p) => p.category?.toLowerCase() === "women"
  );

  // Filter by search term
  const filteredProducts = womenProducts.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginate
  const productsToDisplay = filteredProducts.slice(0, displayLimit);
  const showLoadMoreButton = productsToDisplay.length < filteredProducts.length;

  const handleLoadMore = () => setDisplayLimit((prev) => prev + PRODUCTS_PER_LOAD);

  // Close search bar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
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
      <Nav onProtectedClick={onProtectedClick} onSearchClick={() => setSearchOpen(!searchOpen)} />

      {/* Search Bar */}
      {searchOpen && (
        <div className="container mx-auto px-4 py-3" ref={searchRef}>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-2 w-full focus-within:ring-2 focus-within:ring-orange-400 transition">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setDisplayLimit(PRODUCTS_PER_LOAD);
              }}
              placeholder="Search for products..."
              className="bg-transparent outline-none w-full text-gray-700"
              autoFocus
            />
          </div>
        </div>
      )}

      <main className="mt-16 md:mt-14">
        {/* Hero Section */}
        <section className="relative flex flex-col md:flex-row h-[90vh] overflow-hidden bg-black">
          <div className="flex flex-col justify-center items-start text-left px-8 md:px-20 lg:px-28 bg-black text-white w-full md:w-1/2 relative z-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">WOMEN’S COLLECTION</h1>
            <p className="text-lg md:text-xl mb-8">20–50% OFF ON EXCLUSIVE STYLES</p>
            <button
              onClick={() => navigate("/category/women")}
              className="px-8 py-3 bg-pink-500 hover:bg-pink-600 transition rounded-lg text-white font-semibold"
            >
              SHOP NOW
            </button>
          </div>

          <div className="relative w-full md:w-1/2 h-full bg-black overflow-hidden">
            <video
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 brightness-75"
              src="https://www.express.com/video/upload/v1758895115/express/2025/projects/home-landing/10-october/0930-DIGITAL-39989-wlp-fs/0930-brooklyn-nicola-468x832-mb.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
            <video
              className="relative w-full h-full object-contain z-10"
              src="https://www.express.com/video/upload/v1758895115/express/2025/projects/home-landing/10-october/0930-DIGITAL-39989-wlp-fs/0930-brooklyn-nicola-468x832-mb.mp4"
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </section>

        {/* Shop by Category */}
        <section className="container mx-auto px-4 py-16 bg-white text-black">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2">
              <CategoryTile
                title="Dresses"
                image="https://www.express.com/image/upload/v1758552487/express/2025/projects/category-inline/10-october/0930-DIGITAL-40015-w-dresses/w-dresses-p2-dt-2col.jpg"
                aspect="aspect-[4/3]"
                onClick={() => navigate("/category/dresses")}
              />
            </div>
            <div>
              <CategoryTile
                title="Tops"
                image="https://rukminim2.flixcart.com/image/832/832/xif0q/t-shirt/j/m/v/xl-greenm-vdtrend-original-imahfjj4evadqahf.jpeg?q=70&crop=false"
                aspect="aspect-[1/1]"
                onClick={() => navigate("/category/tops")}
              />
            </div>
            <div>
              <CategoryTile
                title="Jeans"
                image="https://www.express.com/image/upload/v1759182103/express/2025/projects/category-inline/10-october/0930-DIGITAL-40092-visual-cards/0930-visual-cards-dg-nav-jeans-01.jpg"
                aspect="aspect-[3/4]"
                onClick={() => navigate("/category/jeans")}
              />
            </div>
          </div>
        </section>

        {/* Women New Arrivals */}
        <section className="bg-gray-50/70 text-black">
          <div className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-black-600">Collections</h2>
            </div>

            {productsToDisplay.length === 0 ? (
              <p className="text-center py-10">No products found matching your criteria.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {productsToDisplay.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    addToCart={addToCart}
                    currency={currency}
                    btnColor="bg-pink-500 hover:bg-pink-600"
                  />
                ))}
              </div>
            )}

            {showLoadMoreButton && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 rounded-lg border-2 border-pink-500 text-pink-500 font-semibold hover:bg-pink-500 hover:text-white transition-colors duration-300"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer/>
    </div>
  );
};

export default WomenCollection;
