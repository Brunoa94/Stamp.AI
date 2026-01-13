interface PropertyCardProps {
  label: string;
  value: string;
  variant?: "purple" | "pink" | "blue" | "green";
}

const variantStyles = {
  purple: {
    gradient: "bg-linear-to-br from-purple-200 to-purple-100 dark:from-purple-800 dark:to-purple-700",
    border: "border-purple-300 dark:border-purple-600",
    text: "text-purple-700 dark:text-purple-300",
  },
  pink: {
    gradient: "bg-linear-to-br from-pink-200 to-pink-100 dark:from-pink-800 dark:to-pink-700",
    border: "border-pink-300 dark:border-pink-600",
    text: "text-pink-700 dark:text-pink-300",
  },
  blue: {
    gradient: "bg-linear-to-br from-blue-200 to-blue-100 dark:from-blue-800 dark:to-blue-700",
    border: "border-blue-300 dark:border-blue-600",
    text: "text-blue-700 dark:text-blue-300",
  },
  green: {
    gradient: "bg-linear-to-br from-green-200 to-green-100 dark:from-green-800 dark:to-green-700",
    border: "border-green-300 dark:border-green-600",
    text: "text-green-700 dark:text-green-300",
  },
};

export const PropertyCard = ({ label, value, variant = "purple" }: PropertyCardProps) => {
  const styles = variantStyles[variant];

  return (
    <div className={`flex-1 p-4 ${styles.gradient} rounded-xl border ${styles.border} shadow-md`}>
      <p className={`text-xs ${styles.text} uppercase tracking-wide font-medium`}>
        {label}
      </p>
      <p className="font-bold text-gray-900 dark:text-gray-100 mt-1">
        {value}
      </p>
    </div>
  );
};
