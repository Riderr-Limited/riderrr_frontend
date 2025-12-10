import type { ComponentPropsWithoutRef } from "react";

export const Input = (props: ComponentPropsWithoutRef<"input">) => {
  return (
    <input
      className="w-full  border border-gray-400 rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
      {...props}
    />
  );
};
