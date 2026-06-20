import { MapPin } from "lucide-react";
import { Heading } from "@/features/ui/heading";

export function CustomerInfoHeader() {
  return (
    <div className="flex items-center gap-3">
      <MapPin className="h-5 w-5 text-ink/70" />
      <Heading as="h3" variant="card" className="text-ink">
        Shipping Destination
      </Heading>
    </div>
  );
}
