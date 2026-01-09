import { Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert";

interface ITipBannerProps {
  uploadedImage: File | undefined;
}

const TipBanner = ({ uploadedImage }: ITipBannerProps) => {
  if (!uploadedImage) return null;

  return (
    <Alert className="mb-4 bg-linear-to-r from-emerald-50 to-teal-50 border-emerald-200 group hover:from-emerald-100 hover:to-teal-100 hover:border-emerald-300 transition-all duration-500 animate-[slideInDown_0.6s_ease-out]">
      <div className="w-5 h-5 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
        <Lightbulb className="w-3 h-3 text-white" />
      </div>
      <AlertDescription className="text-xs text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300">
        <strong>Tip:</strong> Be specific about style, colors & mood. Example:
        "Anime style like Naruto"
      </AlertDescription>
    </Alert>
  );
};

export default TipBanner;
