import { Textarea } from "@/features/ui/textarea";

interface Props {
  id?: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
}

const PromptTextAreaDisabled = ({
  id = "prompt",
  value,
  placeholder = "Transform this image into a magical fantasy scene with dragons flying over crystal mountains...",
  maxLength = 1000,
}: Props) => {
  return (
    <div className="relative">
      <Textarea
        id={id}
        value={value}
        disabled
        placeholder={placeholder}
        className="px-5 py-4 rounded-2xl resize-none transition-all duration-300 text-gray-700 min-h-30 focus:outline-none shadow-lg hover:shadow-xl hover:shadow-blue-500/20 bg-gray-100 border-2 border-gray-200 cursor-not-allowed"
        maxLength={maxLength}
        readOnly
      />
    </div>
  );
};

export default PromptTextAreaDisabled;
