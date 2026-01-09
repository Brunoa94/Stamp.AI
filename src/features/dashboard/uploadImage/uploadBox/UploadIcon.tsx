import { Upload } from "lucide-react";
import { clsx } from "clsx";
import { colors } from "@/theme";

const uploadZoneStyles = {
  icon: `p-4 rounded-full ${colors.iconGradientPrimary}`,
};

interface Props {
  isDragActive: boolean;
}

const UploadIcon = ({ isDragActive }: Props) => {
  return (
    <div className="mx-auto w-16 h-16 flex items-center justify-center">
      <div
        className={clsx(uploadZoneStyles.icon, {
          "animate-bounce": isDragActive,
          "animate-[float_3s_ease-in-out_infinite]": !isDragActive,
        })}
      >
        <Upload className="w-8 h-8 text-white" />
      </div>
    </div>
  );
};

export default UploadIcon;