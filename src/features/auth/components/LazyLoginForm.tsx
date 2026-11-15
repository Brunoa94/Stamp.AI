"use client";

import dynamic from "next/dynamic";

/**
 * LazyLoginForm
 *
 * The login dialog content, loaded only when a dialog renders it (on open),
 * so the form, brand panel and captcha stay out of every page's first load.
 */
export const LazyLoginForm = dynamic(
  () => import("../login/LoginForm").then((mod) => mod.LoginForm),
  { ssr: false },
);
