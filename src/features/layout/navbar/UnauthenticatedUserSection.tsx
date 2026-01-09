import { Login } from "@/features/auth/login/Login";
import { Register } from "@/features/auth/register/Register";

export function UnauthenticatedUserSection() {
  return (
    <div className="flex items-center gap-2">
      <Login />
      <Register />
    </div>
  );
}
