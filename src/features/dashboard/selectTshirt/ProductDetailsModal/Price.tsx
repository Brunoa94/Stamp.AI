interface PriceProps {
  price: number;
}

export function Price({ price }: PriceProps) {
  return (
    <div className="text-3xl font-bold bg-linear-to-r from-slate-700 to-gray-700 bg-clip-text text-transparent">
      ${price.toFixed(2)}
    </div>
  );
}
