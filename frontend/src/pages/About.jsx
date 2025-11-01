
import React from "react";


export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md py-6">
        <h1 className="text-3xl font-bold text-center text-orange-600">
          About Us
        </h1>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">
        {/* Image */}
        <div className="md:w-1/2">
          <img
            src="model.webp"
            alt="About"
            className="rounded-lg shadow-lg w-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="md:w-1/2">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Our Story
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Welcome to Gravity! We are passionate about providing high-quality
            fashion for everyone. Our mission is to make shopping easy,
            enjoyable, and accessible for all our customers.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed">
            From trendy clothes to timeless classics, we curate our collection
            to ensure you always find something that fits your style. We value
            quality, sustainability, and customer satisfaction above all.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Join us on our journey to redefine fashion shopping. At Gravity, it’s
            more than just clothes — it’s about expressing yourself with confidence.
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-orange-600 text-white py-12 text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-4">
          Explore Our Collection
        </h3>
        <p className="mb-6">
          Discover the latest trends and timeless pieces curated just for you.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition"
        >
          Start Shopping
        </a>
      </div>
    </div>
  );
}
