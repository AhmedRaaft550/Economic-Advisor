import React from "react";
import { Toaster } from "sonner";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="">
      <Toaster position="top-center" duration={3000} richColors />
      {children}
    </div>
  );
};

export default MainLayout;
