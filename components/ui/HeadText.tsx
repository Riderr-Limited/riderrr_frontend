import React from "react";

const HeadText = ({ text, padding }: { text: string; padding: string }) => {
  return (
    <div>
      <h2
        className={`md:text-4xl text-left px-${padding} text-[#04041b] font-bold`}
      >
        {text}
      </h2>
    </div>
  );
};

export default HeadText;
