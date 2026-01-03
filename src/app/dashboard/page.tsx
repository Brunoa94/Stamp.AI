"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SessionDisplay } from "@/components/auth/SessionDisplay";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 border">
            <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
            <SessionDisplay />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}