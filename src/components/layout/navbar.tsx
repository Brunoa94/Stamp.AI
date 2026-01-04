"use client";

import { NavbarBrand } from "./navbar/NavbarBrand";
import { NavbarActions } from "./navbar/NavbarActions";

function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-r from-white via-purple-50/50 to-pink-50/50 backdrop-blur-md border-b border-purple-200/30 px-4 py-4 sticky top-0 z-50 shadow-lg shadow-purple-500/10">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <NavbarBrand />
        <div className="flex items-center gap-6">
          <NavbarActions />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;