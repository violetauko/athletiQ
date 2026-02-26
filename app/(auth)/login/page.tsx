"use client";

import { LoginPage } from "@/components/auth/LoginPage";
import { Suspense } from "react";

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading…</div>}>
      <LoginPage />
    </Suspense>
  );
}