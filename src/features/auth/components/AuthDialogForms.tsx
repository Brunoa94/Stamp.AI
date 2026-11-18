"use client";

import { useState } from "react";
import type { AuthDialogViewT } from "../lib/types/authDialogTypes";
import { LazyLoginForm } from "./LazyLoginForm";
import { LazyRegisterForm } from "./LazyRegisterForm";

/**
 * AuthDialogForms
 *
 * The Login and Sign Up forms of one auth dialog. The footer links swap the
 * form in place, so the dialog never mounts a second dialog on top of itself.
 */

interface PropsI {
  initialView: AuthDialogViewT;
}

export function AuthDialogForms({ initialView }: PropsI) {
  const [view, setView] = useState(initialView);

  return view === "login" ? (
    <LazyLoginForm onSwitchToRegister={() => setView("register")} />
  ) : (
    <LazyRegisterForm onSwitchToLogin={() => setView("login")} />
  );
}
