import { theme } from "@/theme";
import { Send, Sparkles } from "lucide-react";
import clsx from "clsx";
import { ReactNode } from "react";
import { Button } from "@/features/ui/button";

interface ISubmitButtonProps {
  canSubmit: boolean;
  children?: ReactNode;
}

const SubmitButtonRoot = ({ canSubmit, children }: ISubmitButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={!canSubmit}
      className={clsx(theme.button.submit.base, {
        [theme.button.submit.enabled]: canSubmit,
        [theme.button.submit.disabled]: !canSubmit,
      })}
    >
      {children}
    </Button>
  );
};

interface ILoadingProps {
  canSubmit: boolean;
}

const Loading = ({ canSubmit }: ILoadingProps) => {
  return (
    <SubmitButtonRoot canSubmit={canSubmit}>
      <div className="flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mr-3"></div>
        Creating Magic...
      </div>
    </SubmitButtonRoot>
  );
};

interface IActionProps {
  canSubmit: boolean;
}

const Action = ({ canSubmit }: IActionProps) => {
  return (
    <SubmitButtonRoot canSubmit={canSubmit}>
      <div className="flex items-center justify-center">
        <Send className="mr-3 h-5 w-5" />
        <span>Generate Magic ✨</span>
        {canSubmit && <Sparkles className="ml-2 h-4 w-4 animate-pulse" />}
      </div>
    </SubmitButtonRoot>
  );
};

export const SubmitButton = {
  Loading,
  Action,
};
