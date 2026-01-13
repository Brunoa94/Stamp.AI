import { Textarea } from "@/features/ui/textarea";
import { Sparkles } from "lucide-react";

interface Props {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
}

const PromptTextAreaOverLimit = ({
  id = "prompt",
  value,
  onChange,
  onBlur,
  placeholder = "Transform this image into a magical fantasy scene with dragons flying over crystal mountains...",
  maxLength = 1000,
}: Props) => {
  return (
    <div className="relative">
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="px-5 py-4 rounded-2xl resize-none transition-all duration-300 text-gray-700 min-h-30 focus:outline-none shadow-lg hover:shadow-xl hover:shadow-blue-500/20 border-2 border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/50"
        maxLength={maxLength}
      />

      {value.length > 0 && (
        <Sparkles className="absolute top-4 right-4 w-5 h-5 text-purple-400 animate-pulse" />
      )}
    </div>
  );
};

export default PromptTextAreaOverLimit;
