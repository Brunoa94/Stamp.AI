import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/features/ui/dialog";
import { OrderImage } from "../../helpers/OrderImage";

interface PropsI {
  imageUrl: string | null;
  onRequestClose: () => void;
}

export function OrderItemZoomDialog({ imageUrl, onRequestClose }: PropsI) {
  return (
    <Dialog
      open={Boolean(imageUrl)}
      onOpenChange={(isOpen) => {
        if (!isOpen) onRequestClose();
      }}
    >
      <DialogContent className="max-w-4xl border border-white/30 bg-slate-950/90 p-3 sm:p-4">
        <DialogTitle className="sr-only">Order item zoom preview</DialogTitle>
        <DialogDescription className="sr-only">
          Enlarged view of the selected order item image.
        </DialogDescription>

        {imageUrl && (
          <div className="relative overflow-hidden rounded-lg bg-black/40">
            <OrderImage
              src={imageUrl}
              alt="Zoomed order item"
              width={1200}
              height={1200}
              className="h-auto max-h-[78vh] w-full object-contain"
              sizes="(max-width: 1024px) 100vw, 1000px"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
