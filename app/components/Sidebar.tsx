"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FaChartLine,
  FaBox,
  FaTags,
  FaShoppingCart,
  FaStar,
  FaPercent,
  FaLink,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../lib/auth/auth.context";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: FaChartLine },
  { name: "Products", href: "/products", icon: FaBox },
  { name: "Categories", href: "/categories", icon: FaTags },
  { name: "Orders", href: "/orders", icon: FaShoppingCart },
  { name: "Reviews", href: "/reviews", icon: FaStar },
  { name: "Discount Codes", href: "/discount-codes", icon: FaPercent },
  { name: "Header Links", href: "/header-links", icon: FaLink },
  { name: "Settings", href: "/settings", icon: FaCog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="h-full bg-custom-gradient-blue text-white w-72">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-white/10">
        <span className="font-bold text-xl">Shahbaz Store</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? "bg-custom-blue text-white" : "hover:bg-white/10"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="ml-3 text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10">
        <div className="px-3 py-4 space-y-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span className="ml-3 text-sm">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
