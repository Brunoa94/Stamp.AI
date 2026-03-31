import { Login } from "@/features/auth/login/Login";
import { Register } from "@/features/auth/register/Register";
import { navbarTheme } from "@/theme/components";

export function UnauthenticatedUserSection() {
  return (
    <div className={navbarTheme.actions.unauthContainer}>
      <Login className={navbarTheme.actions.loginButton} />
      <Register className={navbarTheme.actions.registerButton} />
    </div>
  );
}
