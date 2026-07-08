interface PropsI {
  index: number;
}

export function OrdersGridItemIndex({ index }: PropsI) {
  return (
    <div className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center bg-(--color-stamp-chocolate) text-[9px] font-bold text-white">
      {String(index).padStart(2, "0")}
    </div>
  );
}
