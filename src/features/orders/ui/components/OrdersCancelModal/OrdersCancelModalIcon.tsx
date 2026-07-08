import { TriangleAlert } from "lucide-react";

export function OrdersCancelModalIcon() {
  return (
    <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500">
      <TriangleAlert className="h-10 w-10" />
    </div>
  );
}
