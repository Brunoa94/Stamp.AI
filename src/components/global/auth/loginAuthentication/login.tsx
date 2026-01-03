"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { LogIn } from "lucide-react";
import React, { Suspense } from "react";

const LoginForm = React.lazy(() => import("./loginForm"));

function Login() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label="Open login dialog">
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Button>
      </DialogTrigger>
      <Suspense>
        <LoginForm />
      </Suspense>
    </Dialog>
  );
}

export default Login;
