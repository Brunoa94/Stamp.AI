import { Image as ImageIcon } from "lucide-react";
import { clsx } from "clsx";
import { colors } from "@/theme";
import { Button } from "@/features/ui/button";

interface Props {
  isDragActive: boolean;
}

const UploadButton = ({ isDragActive }: Props) => {
  return (
    <div
      className={clsx({
        "animate-pulse": isDragActive,
      })}
    >
      <Button
        variant="outline"
        className="bg-linear-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-gray-400 hover:shadow-lg hover:shadow-slate-500/25 transition-all duration-300 hover:scale-105"
      >
        <ImageIcon className="mr-2 h-5 w-5 text-purple-500" />
        <span className={colors.textGradient + " font-semibold"}>
          Choose Your Image
        </span>
      </Button>
    </div>
  );
};

export default UploadButton;
