import { Copyright } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-[#337BFF] pt-4 text-white flex flex-col items-center justify-between">
      <div></div>
      <div className="flex items-center justify-center gap-2">
        <Copyright /> All Right Reserved, powered by logi-Q
      </div>
    </div>
  );
};

export default Footer;
