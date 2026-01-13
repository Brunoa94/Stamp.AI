import { CheckCircleIcon } from "@/theme";
import { ReactNode } from "react";
import clsx from "clsx";

interface StatusHeaderProps {
  title: string;
  icon?: ReactNode;
  variant?: "success" | "info" | "warning" | "error";
  className?: string;
}

const variantStyles = {
  success: {
    icon: "text-green-600 dark:text-green-400",
    title: "from-green-600 via-emerald-600 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400",
  },
  info: {
    icon: "text-purple-600 dark:text-purple-400",
    title: "from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400",
  },
  warning: {
    icon: "text-yellow-600 dark:text-yellow-400",
    title: "from-yellow-600 via-orange-600 to-red-600 dark:from-yellow-400 dark:via-orange-400 dark:to-red-400",
  },
  error: {
    icon: "text-red-600 dark:text-red-400",
    title: "from-red-600 via-rose-600 to-pink-600 dark:from-red-400 dark:via-rose-400 dark:to-pink-400",
  },
};

export const StatusHeader = ({
  title,
  icon,
  variant = "success",
  className
}: StatusHeaderProps) => {
  const IconComponent = icon || <CheckCircleIcon className="w-6 h-6" />;
  const styles = variantStyles[variant];

  return (
    <div className={clsx("text-center", className)}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className={styles.icon}>{IconComponent}</span>
        <h3 className={clsx(
          "text-2xl font-bold bg-linear-to-r bg-clip-text text-transparent",
          styles.title
        )}>
          {title}
        </h3>
        <span className={styles.icon}>{IconComponent}</span>
      </div>
    </div>
  );
};
