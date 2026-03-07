import Link from "next/link";
import { navbarTheme } from "@/theme/components";

export function NavbarBrand() {
  return (
    <Link href="/" className={navbarTheme.brand.link}>
      <span className={navbarTheme.brand.text}>
        Stamp
        <span className={navbarTheme.brand.dot} />
        AI
      </span>
    </Link>
  );
}
