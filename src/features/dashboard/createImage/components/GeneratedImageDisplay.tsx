import { Button } from "@/features/ui/button";
import { componentThemes } from "@/theme/components";

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
  return (
    <div className="bg-linear-to-br from-white via-gray-50/50 to-purple-50/30 rounded-2xl p-8 border border-gray-200 shadow-xl">
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-auto max-w-2xl mx-auto block rounded-xl"
      />

      <div className="mt-6 flex justify-center">
        <Button
          onClick={onUseImage}
          className={componentThemes.button.primary}
        >
          Use this image
        </Button>
      </div>
    </div>
  );
};

export default GeneratedImageDisplay;
