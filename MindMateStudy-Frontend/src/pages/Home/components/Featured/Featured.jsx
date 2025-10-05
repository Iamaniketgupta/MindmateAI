import React from "react";
import InfiniteMarquee from "./InfiniteMarquee";
// Demo data
const demoData = [
  {
    id: 1,
    src: "/ctlogo.png",
    alt: "Ct",
  },
  {
    id: 2,
    src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Doubtnut_new_logo.png/1200px-Doubtnut_new_logo.png?20220819084201",
    alt: "doubtnut",
  },

  {
    id: 5,
    src: "https://pcte.edu.in/wp-content/uploads/2025/03/PCTE-Logo-Change-Size.png",
    alt: "pcte",
  },
];

const Featured = () => {
  return (
    <div className="pt-10 pb-6 font-poppins">
      <h2 className="md:text-4xl lg:text-5xl text-2xl mb-6 font-bold font-technical w-full md:text-center px-4">
        Our
        <span className="bg-gradient-to-r from-gradient-secondary to-gradient-secondary text-transparent bg-clip-text">
          {" "}
          Education
        </span>{" "}
        Partners
      </h2>

      {/* Infinite Horizontal Carousel */}
      <InfiniteMarquee>
        {demoData.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl hover:scale-110 transition-all duration-300 min-w-44 px-4 flex items-center justify-center md:h-16 h-14 overflow-hidden "
          >
            <img
              src={item.src}
              alt={item.alt}
              className={`${item.id === 1 ? "transform scale-150" : "w-"} object-contain max-h-full`}
            />
          </div>
        ))}
      </InfiniteMarquee>
    </div>
  );
};

export default Featured;
