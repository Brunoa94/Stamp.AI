import { NavbarBrand } from "./navbar/NavbarBrand";
import { NavbarActions } from "./navbar/NavbarActions";

function Navbar() {
  return (
    <nav className="w-full bg-linear-to-r from-white via-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 backdrop-blur-md border-b border-purple-200/30 dark:border-purple-800/30 px-4 py-4 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-purple-500/10 dark:shadow-purple-500/20 transition-all duration-300">
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
