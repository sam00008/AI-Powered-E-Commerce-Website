import React from "react";
import videoFile from "../assets/October_launch_1920x900.webm";
import largeImage from "../assets/three-in-one.avif";
import girlImage from "../assets/girl.avif";
import boyImage from "../assets/boy.avif";

export default function Background({ onProtectedClick }) {
  return (
    <div className="w-full m-0 p-0">
      {/* Video Section */}
      <div className="relative w-full h-screen m-0 p-0">
        <video
          src={videoFile}
          autoPlay
          muted
          loop
          className="w-full h-full object-cover m-0 p-0"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-20">
          <p className="font-bold text-[clamp(40px,6vw,92px)] leading-none drop-shadow-lg">
            20-50% OFF
          </p>
          <p className="font-bold text-[clamp(40px,6vw,92px)] leading-none drop-shadow-lg mt-[-10px]">
            EVERYTHING
          </p>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => onProtectedClick("/category/women")}
              className="px-6 py-2 rounded-2xl bg-[#F06C0F] text-white font-semibold hover:bg-orange-600 transition duration-300"
            >
              WOMEN
            </button>
            <button
              onClick={() => onProtectedClick("/category/men")}
              className="px-6 py-2 rounded-2xl bg-[#F06C0F] text-white font-semibold hover:bg-orange-600 transition duration-300"
            >
              MEN
            </button>
          </div>
        </div>
      </div>

      {/* Large Single Image */}
      <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden mt-4">
        <img src={largeImage} alt="large" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <p
            style={{
              fontFamily: "express-sans-web-med, Arial, Helvetica, sans-serif",
              fontSize: "clamp(60px, -2.935rem + 11.392vw, 60px)",
              lineHeight: "1",
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            SHADES OF FALL
          </p>
          <p
            style={{
              fontFamily: "express-sans-web-reg, Arial, Helvetica, sans-serif",
              fontSize: "clamp(14px, -2.935rem + 11.392vw, 14px)",
              lineHeight: "1.2",
              textAlign: "center",
            }}
          >
            Luxe neutrals for the new season.
          </p>
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => onProtectedClick("/category/women")}
              className="px-4 py-2 rounded-2xl bg-[#F06C0F] text-white font-semibold hover:bg-orange-600 transition duration-300 text-sm md:text-base"
            >
              WOMEN
            </button>
            <button
              onClick={() => onProtectedClick("/category/men")}
              className="px-4 py-2 rounded-2xl bg-[#F06C0F] text-white font-semibold hover:bg-orange-600 transition duration-300 text-sm md:text-base"
            >
              MEN
            </button>
          </div>
        </div>
      </div>

      {/* Girl & Boy Images Side by Side */}
      <div className="flex flex-col md:flex-row w-full gap-4 px-4 md:px-0 mt-4">
        {/* Girl */}
        <div className="relative w-full md:w-1/2 h-[60vh] overflow-hidden">
          <img src={girlImage} alt="girl" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <p
              style={{
                fontFamily: "express-sans-web-med, Arial, Helvetica, sans-serif",
                fontSize: "clamp(32px, -2.935rem + 6vw, 32px)",
                lineHeight: "1",
                textAlign: "center",
              }}
            >
              SWEATER
            </p>
            <p
              style={{
                fontFamily: "express-sans-web-reg, Arial, Helvetica, sans-serif",
                fontSize: "clamp(32px, -2.935rem + 6vw, 32px)",
                lineHeight: "1",
                textAlign: "center",
                marginTop: "8px",
              }}
            >
              SEASON
            </p>
            <div className="flex gap-4 mt-2 justify-center">
              <button
                onClick={() => onProtectedClick("/category/women")}
                className="px-3 py-1 rounded-2xl bg-[#F06C0F] text-white font-semibold hover:bg-orange-600 transition duration-300 text-sm md:text-base"
              >
                WOMEN
              </button>
              <button
                onClick={() => onProtectedClick("/category/men")}
                className="px-3 py-1 rounded-2xl bg-[#F06C0F] text-white font-semibold hover:bg-orange-600 transition duration-300 text-sm md:text-base"
              >
                MEN
              </button>
            </div>
          </div>
        </div>

        {/* Boy */}
        <div className="relative w-full md:w-1/2 h-[60vh] overflow-hidden">
          <img src={boyImage} alt="boy" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <p
              style={{
                fontFamily: "express-sans-web-med, Arial, Helvetica, sans-serif",
                fontSize: "clamp(32px, -2.935rem + 6vw, 32px)",
                lineHeight: "1",
                textAlign: "center",
              }}
            >
              SUIT
            </p>
            <p
              style={{
                fontFamily: "express-sans-web-reg, Arial, Helvetica, sans-serif",
                fontSize: "clamp(32px, -2.935rem + 6vw, 32px)",
                lineHeight: "1",
                textAlign: "center",
                marginTop: "8px",
              }}
            >
              YOURSELF
            </p>
            <div className="flex gap-4 mt-2 justify-center">
              <button
                onClick={() => onProtectedClick("/category/women")}
                className="px-3 py-1 rounded-2xl bg-[#F06C0F] text-white font-semibold hover:bg-orange-600 transition duration-300 text-sm md:text-base"
              >
                WOMEN
              </button>
              <button
                onClick={() => onProtectedClick("/category/men")}
                className="px-3 py-1 rounded-2xl bg-[#F06C0F] text-white font-semibold hover:bg-orange-600 transition duration-300 text-sm md:text-base"
              >
                MEN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="mt-4"></div>
    </div>
  );
}
