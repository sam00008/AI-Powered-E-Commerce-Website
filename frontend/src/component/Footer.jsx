// component/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h2 className="text-xl font-bold mb-4">About Us</h2>
            <p className="text-gray-400 text-sm">
              We are a company dedicated to providing amazing products and services to our customers.
              Your satisfaction is our priority.
            </p>
          </div>

          {/* Links */}
          <div>
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="#" className="hover:text-white">Products</a></li>
              <li><a href="/about" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xl font-bold mb-4">Contact</h2>
            <p className="text-gray-400 text-sm">Email: sameealam50@gmail.com</p>
            <p className="text-gray-400 text-sm">Phone: +91 123 456 7890</p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="hover:text-white">Facebook</a>
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">LinkedIn</a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-700 pt-4 text-center text-gray-500 text-sm">
          &copy; 2025 Your Company. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
