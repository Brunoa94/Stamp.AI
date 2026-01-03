"use client";

import { NavbarBrand } from "./navbar/NavbarBrand";
import { NavbarActions } from "./navbar/NavbarActions";

function Navbar() {
  return (
    <nav className="w-full border-b bg-background px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <NavbarBrand />
        <div className="flex items-center gap-4">
          <NavbarActions />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;