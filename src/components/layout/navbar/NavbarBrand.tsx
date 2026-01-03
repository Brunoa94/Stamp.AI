import Link from "next/link";

export function NavbarBrand() {
  return (
    <div className="flex items-center">
      <Link href="/">
        <h1 className="text-xl font-semibold text-foreground hover:text-gray-600 transition-colors cursor-pointer">
          Imaginary Builder AI
        </h1>
      </Link>
    </div>
  );
}