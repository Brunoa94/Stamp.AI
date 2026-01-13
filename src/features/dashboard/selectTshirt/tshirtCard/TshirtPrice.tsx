interface Props {
  price: number;
}

export default function TshirtPrice({ price }: Props) {
  return (
    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
      <p className="text-lg font-bold bg-linear-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
        ${price.toFixed(2)}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-400">Base price</p>
    </div>
  );
}
