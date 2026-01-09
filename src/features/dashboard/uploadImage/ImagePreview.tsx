import { X, Check, Sparkles } from "lucide-react";
import { colors } from "@/theme";
import { Button } from "@/features/ui/button";

interface PropsI {
  preview: string;
  fileName: string;
  fileSize: number;
  onRemove: () => void;
}

const ImagePreview = ({ preview, fileName, fileSize, onRemove }: PropsI) => {
  return (
    <div className="space-y-6 animate-[fadeInScale_0.5s_ease-out]">
      <div className="relative group">
        {/* Colorful border wrapper */}
        <div className={`${colors.previewBorder} p-1 rounded-2xl`}>
          <img
            src={preview}
            alt="Uploaded preview"
            className="w-full max-w-md mx-auto rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>

        {/* Success badge */}
        <div
          className={`absolute -top-3 -right-3 w-8 h-8 ${colors.previewSuccess} rounded-full flex items-center justify-center shadow-lg animate-[bounceIn_0.6s_ease-out]`}
        >
          <Check className="w-5 h-5 text-white" />
        </div>

        {/* Remove button */}
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 w-8 h-8 rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* File info */}
      <div
        className={`text-center p-4 rounded-xl ${colors.previewInfo} border border-green-200`}
      >
        <div className="flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-green-500 mr-2" />
          <p className="text-xs text-green-600">
            {fileName} • {Math.round(fileSize / 1024)} KB
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
