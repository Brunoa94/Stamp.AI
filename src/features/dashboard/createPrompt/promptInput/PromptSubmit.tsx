import { Send, Sparkles } from "lucide-react";
import { PropsWithChildren } from "react";
import { clsx } from "clsx";
import { Button } from "@/features/ui/button";

interface ButtonProps extends PropsWithChildren {
  canSubmit: boolean;
}

const PromptButton = ({ children, canSubmit }: ButtonProps) => (
  <Button
    type="submit"
    disabled={!canSubmit}
    className={clsx(
      "w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300",
      canSubmit
        ? "bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    )}
  >
    {children}
  </Button>
);

export const PromptSubmit = ({ canSubmit }: Pick<ButtonProps, "canSubmit">) => (
  <PromptButton canSubmit={canSubmit}>
    <div className="flex items-center justify-center">
      <Send className="mr-3 h-5 w-5" />
      <span>Generate Magic ✨</span>
      {canSubmit && <Sparkles className="ml-2 h-4 w-4 animate-pulse" />}
    </div>
  </PromptButton>
);

export const PromptProcessing = ({
  canSubmit,
}: Pick<ButtonProps, "canSubmit">) => (
  <PromptButton canSubmit={canSubmit}>
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-3"></div>
      Creating Magic...
    </div>
  </PromptButton>
);
