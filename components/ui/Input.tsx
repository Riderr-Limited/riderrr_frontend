import type { ComponentPropsWithoutRef } from "react";

export const Input = (props: ComponentPropsWithoutRef<"input">) => {
  return (
    <input
      className="w-full border rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-200"
      {...props}
    />
  );
};
