import { theme } from "@/theme";
import { clsx } from "clsx";

interface Props {
  hasUploadedImage: boolean;
}

const PromptSectionHeader = ({ hasUploadedImage }: Props) => {
  return (
    <div className="flex items-center mb-6">
      <div
        className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 transition-all duration-700 ease-out animate-[bounceIn_0.6s_ease-out_0.2s_both] group-hover:scale-125 group-hover:rotate-12",
          hasUploadedImage
            ? "bg-linear-to-r from-blue-500 to-purple-500 scale-110"
            : "bg-linear-to-r from-gray-400 to-gray-500 scale-100"
        )}
      >
        2
      </div>
      <h2
        className={clsx(
          theme.prompt.title,
          "transition-all duration-700 ease-out group-hover:scale-105",
          !hasUploadedImage
            ? "opacity-50 transform translate-y-2"
            : "opacity-100 transform translate-y-0"
        )}
      >
        Describe Your Vision
      </h2>
    </div>
  );
};

export default PromptSectionHeader;
