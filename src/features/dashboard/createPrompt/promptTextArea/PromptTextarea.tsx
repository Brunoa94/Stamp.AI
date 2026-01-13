import { Sparkles } from "lucide-react";
import PromptTextAreaOverLimit from "./PromptTextAreaOverLimit";
import PromptTextAreaDisabled from "./PromptTextAreaDisabled";
import { Textarea } from "@/features/ui/textarea";

interface Props {
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  isOverLimit?: boolean;
}

const PromptTextArea = ({
  id = "prompt",
  value,
  onChange,
  onBlur,
  placeholder = "Transform this image into a magical fantasy scene with dragons flying over crystal mountains...",
  maxLength = 1000,
  disabled = false,
  isOverLimit = false,
}: Props) => {
  if (disabled) return <PromptTextAreaDisabled value={value} />;

  if (isOverLimit)
    return <PromptTextAreaOverLimit value={value} onChange={onChange} onBlur={onBlur} />;

  return (
    <div className="relative">
      <Textarea
        id={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="px-5 py-4 rounded-2xl resize-none transition-all duration-300 text-white min-h-30 focus:outline-none shadow-lg hover:shadow-xl hover:shadow-blue-500/20 border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
        maxLength={maxLength}
      />

      {value.length > 0 && (
        <Sparkles className="absolute top-4 right-4 w-5 h-5 text-purple-400 animate-pulse" />
      )}
    </div>
  );
};

export default PromptTextArea;
