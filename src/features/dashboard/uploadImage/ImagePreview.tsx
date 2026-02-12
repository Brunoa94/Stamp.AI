import { X } from "lucide-react";
import { colors } from "@/theme";
import { Button } from "@/features/ui/button";

interface Props {
  preview: string;
  fileName: string;
  fileSize: number;
  onRemove: () => void;
}

const ImagePreview = ({ preview, onRemove }: Props) => {
  return (
    <div className="animate-[fadeInScale_0.5s_ease-out]">
      <div className="relative group">
        {/* Colorful border wrapper */}
        <div className={`${colors.previewBorder} py-6 rounded-2xl`}>
          <img
            src={preview}
            alt="Uploaded preview"
            className="w-full max-w-md mx-auto max-h-full rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        {/* Delete button */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 w-8 h-8 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ImagePreview;
