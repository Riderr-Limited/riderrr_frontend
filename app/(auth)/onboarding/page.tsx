import OrgRegistration from "@/components/auth/OrgRegistration";
import React from "react";

const page = () => {
  return (
    <div className="flex bg-[#F1F1F1] flex-col min-h-screen bg-indigo-50s">
      <header className="bg-white w-full mb-12 flex items-center font-bold shadow p-4 text-[#337BFF]">
        <p>RIDERR</p>
      </header>
      <OrgRegistration />
    </div>
  );
};

export default page;
