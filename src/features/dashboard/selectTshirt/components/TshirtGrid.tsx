import TshirtTypeCard from "../TshirtCard/TshirtTypeCard";
import { TshirtType } from "../useTshirtSelection";

interface Props {
  tshirts: TshirtType[];
  selectedTshirt: TshirtType | null;
  onTshirtSelect: (tshirt: TshirtType) => void;
}

export default function TshirtGrid({
  tshirts,
  selectedTshirt,
  onTshirtSelect,
}: Props) {
  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 list-none">
      {tshirts.map((tshirt) => (
        <li key={tshirt.id}>
          <TshirtTypeCard
            tshirt={tshirt}
            isSelected={selectedTshirt?.id === tshirt.id}
            onSelect={onTshirtSelect}
          />
        </li>
      ))}
    </ul>
  );
}
