import { Login } from "@/components/auth/login/Login";
import { Register } from "@/components/auth/register/Register";

export function UnauthenticatedUserSection() {
  return (
    <div className="flex items-center gap-2">
      <Login />
      <Register />
    </div>
  );
}