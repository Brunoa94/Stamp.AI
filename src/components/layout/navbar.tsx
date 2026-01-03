"use client";

import Login from "@/components/global/auth/loginAuthentication/login";

function Navbar() {
  return (
    <nav className="w-full border-b bg-background px-4 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-foreground">
            Imaginary Builder AI
          </h1>
        </div>

        <div className="flex items-center">
          <Login />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;