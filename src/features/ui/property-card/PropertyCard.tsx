interface PropertyCardProps {
  label: string;
  value: string;
  variant?: "slate" | "gray" | "blue" | "green";
}

const variantStyles = {
  slate: {
    gradient:
      "bg-linear-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700",
    border: "border-slate-300 dark:border-slate-600",
    text: "text-slate-700 dark:text-slate-300",
  },
  gray: {
    gradient:
      "bg-linear-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700",
    border: "border-gray-300 dark:border-gray-600",
    text: "text-gray-700 dark:text-gray-300",
  },
  blue: {
    gradient:
      "bg-linear-to-br from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-700",
    border: "border-blue-300 dark:border-blue-600",
    text: "text-blue-700 dark:text-blue-300",
  },
  green: {
    gradient:
      "bg-linear-to-br from-green-200 to-green-100 dark:from-green-800 dark:to-green-700",
    border: "border-green-300 dark:border-green-600",
    text: "text-green-700 dark:text-green-300",
  },
};

export const PropertyCard = ({
  label,
  value,
  variant = "slate",
}: PropertyCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex-1 p-4 ${styles.gradient} rounded-xl border ${styles.border} shadow-md`}
    >
      <p
        className={`text-xs ${styles.text} uppercase tracking-wide font-medium`}
      >
        {label}
      </p>
      <p className="font-bold text-gray-900 dark:text-gray-100 mt-1">{value}</p>
    </div>
  );
};
