import React from "react";
import { FaRegCircle } from "react-icons/fa";

export default function Hero({ heroCount, setHeroCount }) {
  return (
    <div className="absolute top-20 left-10 z-30 text-white flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Discover Your Style</h1>
      <h2 className="text-2xl">New Arrivals Just for You</h2>

      <div className="flex gap-2 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <FaRegCircle
            key={i}
            className={`w-6 h-6 cursor-pointer ${heroCount === i ? "fill-orange-500" : "fill-gray-400"}`}
            onClick={() => setHeroCount(i)}
          />
        ))}
      </div>
    </div>
  );
}
