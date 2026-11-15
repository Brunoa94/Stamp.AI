"use client";

import dynamic from "next/dynamic";

/**
 * LazyRegisterForm
 *
 * The sign-up dialog content, loaded only when a dialog renders it (on open),
 * so the form, brand panel and captcha stay out of every page's first load.
 */
export const LazyRegisterForm = dynamic(
  () => import("../register/RegisterForm").then((mod) => mod.RegisterForm),
  { ssr: false },
);
