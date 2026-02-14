interface PriceProps {
  price: number;
}

export function Price({ price }: PriceProps) {
  return (
    <div className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
      ${price.toFixed(2)}
    </div>
  );
}
