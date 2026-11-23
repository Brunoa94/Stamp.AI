import { TriangleAlert } from "lucide-react";

export function OrdersCancelModalIcon() {
  return (
    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--color-stamp-error)/10 text-(--color-stamp-error)">
      <TriangleAlert className="h-8 w-8" />
    </div>
  );
}
