import type { LucideIcon } from "lucide-react";

export type StampStepTypes = {
  id: string;
  number: string;
  title: string;
  label: string;
};

export type BrutalistColorTypes = 'purple' | 'cyan' | 'orange';

export type StampStepIconTypes = {
  icon: LucideIcon;
  color: BrutalistColorTypes;
  tooltip: string;
};

export type ArtStyleIdTypes = 'realistic' | 'cartoon' | 'abstract' | 'minimal' | 'watercolor' | 'oil' | 'digital' | 'sketch';

export type ArtStyleTypes = {
  id: ArtStyleIdTypes;
  label: string;
};

export type ProductTypeIdTypes = 'tee' | 'hoodie' | 'tote' | 'poster';

export type ProductTypeInfoTypes = {
  blueprintIds: number[];
  name: string;
  icon: string;
  specs: string;
  hoverColor: string;
};
