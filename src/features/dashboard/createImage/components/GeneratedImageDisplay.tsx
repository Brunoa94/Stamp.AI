import { Button } from "@/features/ui/button";
import { componentThemes } from "@/theme/components";
import { CheckCircleIcon } from "@/theme";
import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

interface Props {
  imageUrl: string;
  altText?: string;
  onUseImage?: () => void;
}

const GeneratedImageDisplay = ({
  imageUrl,
  altText = "AI Generated Image",
  onUseImage,
}: Props) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="bg-linear-to-br from-white via-gray-50/50 to-purple-50/30 rounded-2xl p-8 border border-gray-200 shadow-xl">
      <div className="relative w-full max-w-2xl mx-auto aspect-square">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
            <div className="animate-pulse text-gray-400">Loading image...</div>
          </div>
        )}
        <Image
          src={imageUrl}
          alt={altText}
          width={1024}
          height={1024}
          className="w-full h-auto rounded-xl"
          onLoad={() => setImageLoaded(true)}
          priority
        />
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          type="button"
          onClick={onUseImage}
          className={clsx(
            "px-8 py-3 text-lg font-semibold rounded-xl transition-all duration-300",
            "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500",
            "hover:from-purple-600 hover:via-pink-600 hover:to-purple-600",
            "dark:from-purple-600 dark:via-pink-600 dark:to-purple-600",
            "dark:hover:from-purple-700 dark:hover:via-pink-700 dark:hover:to-purple-700",
            "text-white shadow-lg hover:shadow-xl",
            "hover:shadow-purple-500/50 dark:hover:shadow-purple-500/40",
            "hover:scale-105 active:scale-95",
            "flex items-center gap-2"
          )}
        >
          <CheckCircleIcon className="w-5 h-5" />
          Use this image
        </Button>
      </div>
    </div>
  );
};

export default GeneratedImageDisplay;
