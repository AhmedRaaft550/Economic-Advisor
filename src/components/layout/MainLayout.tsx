import React from "react";
import { Toaster } from "sonner";
import TabsComponent from "../ui/Tabs";
import ProtectedGuard from "../shared/ProductedGuard";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <Toaster position="top-center" duration={3000} richColors />
      {children}
      <ProtectedGuard>
        <TabsComponent />
      </ProtectedGuard>
    </div>
  );
};

export default MainLayout;
