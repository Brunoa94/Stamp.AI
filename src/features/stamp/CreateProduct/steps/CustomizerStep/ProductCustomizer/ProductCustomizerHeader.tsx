interface ProductCustomizerHeaderProps {
  title?: string;
  description?: string;
}

export default function ProductCustomizerHeader({
  title = "Customize Your Product",
  description = "Select your t-shirt type and customize your order",
}: ProductCustomizerHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-700 to-gray-700">
        {title}
      </h2>
      <p className="text-gray-600 mt-2">{description}</p>
    </div>
  );
}
