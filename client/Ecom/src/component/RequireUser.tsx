import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

// Only logged-in buyers (role "user") can open the wrapped page
const RequireUser = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");

  if (!token || role !== "user") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RequireUser;
