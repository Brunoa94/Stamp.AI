import { NavbarBrand } from "./navbar/NavbarBrand";
import { NavbarActions } from "./navbar/NavbarActions";

function Navbar() {
  return (
    <nav className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 px-4 py-4 fixed top-0 left-0 right-0 z-50 shadow-sm transition-all duration-300">
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
