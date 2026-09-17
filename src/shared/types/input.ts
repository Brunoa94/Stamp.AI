import type { UseFormRegister } from "react-hook-form";

export type InputT = {
  defaultValue?: string | number;
  name: string;
  title: string;
  register: UseFormRegister<any>;
};
