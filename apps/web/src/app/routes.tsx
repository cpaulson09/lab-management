import { createBrowserRouter, Navigate } from "react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Catalog } from "@/pages/Catalog/Catalog";
import { Orders } from "@/pages/Orders/Orders";
import { Patients } from "@/pages/Patients/Patients";

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/orders" replace /> },
      { path: "patients", element: <Patients /> },
      { path: "catalog", element: <Catalog /> },
      { path: "orders", element: <Orders /> },
    ],
  },
]);
