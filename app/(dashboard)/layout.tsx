"use client";

import LayoutContent from "../components/LayoutContent";
import { ProtectedRoute } from "../../lib/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <LayoutContent>{children}</LayoutContent>
    </ProtectedRoute>
  );
}
