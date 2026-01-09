import { colors } from "@/theme";

interface Props {
  isDragActive: boolean;
}

const UploadText = ({ isDragActive }: Props) => {
  return (
    <div className="space-y-2">
      <p className={colors.textGradient + " text-xl font-bold"}>
        {isDragActive
          ? "Drop your magical image here! ✨"
          : "Upload Your Creative Canvas"}
      </p>
      <p className="text-sm text-gray-600 max-w-xs mx-auto">
        Drag & drop or click to select your image
        <br />
        <span className="text-xs text-gray-500">
          PNG, JPG, GIF, WEBP supported
        </span>
      </p>
    </div>
  );
};

export default UploadText;