import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InputT } from "@/types/input";
const InputText = ({ defaultValue, name, title, register }: InputT) => {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name}>{title}</Label>
      <Input {...register(name)} defaultValue={defaultValue ?? ""} />
    </div>
  );
};

const InputNumber = ({ defaultValue, name, title, register }: InputT) => {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor={name}>{title}</Label>
      <Input
        {...register(name, { valueAsNumber: true })}
        type="number"
        defaultValue={defaultValue ?? 0}
      />
    </div>
  );
};

const InputPassword = ({ defaultValue, name, title, register }: InputT) => {
  return (
    <div className="grid gap-3">
      <Label htmlFor={name}>{title}</Label>
      <Input
        {...register(name)}
        defaultValue={defaultValue ?? ""}
        type="password"
      />
    </div>
  );
};

export const Form = {
  InputText,
  InputPassword,
  InputNumber,
};
