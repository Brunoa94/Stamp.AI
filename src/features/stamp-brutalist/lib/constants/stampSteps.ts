import { Upload, Zap, Sparkles, Eye, ShoppingBag, Settings, CheckCircle, HelpCircle } from "lucide-react";
import type { StampStepTypes, StampStepIconTypes, ArtStyleTypes, ProductTypeIdTypes, ProductTypeInfoTypes } from "../types/stampTypes";

export const STAMP_STEPS: readonly StampStepTypes[] = [
  {
    id: "stamp-step-1",
    number: "01",
    title: "Upload",
    label: "Image Protocol",
  },
  {
    id: "stamp-step-2",
    number: "02",
    title: "Synthesis",
    label: "Neural Input",
  },
  {
    id: "stamp-step-3",
    number: "03",
    title: "Generation",
    label: "AI Processing",
  },
  {
    id: "stamp-step-4",
    number: "04",
    title: "Results",
    label: "Output Display",
  },
  {
    id: "stamp-step-5",
    number: "05",
    title: "Product",
    label: "Product Spec",
  },
  {
    id: "stamp-step-6",
    number: "06",
    title: "Customize",
    label: "Color & Size",
  },
  {
    id: "stamp-step-7",
    number: "07",
    title: "Production",
    label: "Manufacturing",
  },
  {
    id: "stamp-step-8",
    number: "08",
    title: "Finalize",
    label: "Confirmation",
  },
] as const;

export const STAMP_STEP_ICONS: Record<number, StampStepIconTypes> = {
  1: { icon: Upload, color: 'purple' as const, tooltip: '01 Upload Protocol' },
  2: { icon: Zap, color: 'cyan' as const, tooltip: '02 Synthesis Input' },
  3: { icon: Sparkles, color: 'orange' as const, tooltip: '03 Neural Process' },
  4: { icon: Eye, color: 'purple' as const, tooltip: '04 Visual Result' },
  5: { icon: ShoppingBag, color: 'cyan' as const, tooltip: '05 Product Spec' },
  6: { icon: Settings, color: 'orange' as const, tooltip: '06 Customize' },
  7: { icon: Settings, color: 'purple' as const, tooltip: '07 Production' },
  8: { icon: CheckCircle, color: 'cyan' as const, tooltip: '08 Final Review' },
} as const;

export const ART_STYLES: readonly ArtStyleTypes[] = [
  { id: 'realistic' as const, label: 'Realistic' },
  { id: 'cartoon' as const, label: 'Cartoon' },
  { id: 'abstract' as const, label: 'Abstract' },
  { id: 'minimal' as const, label: 'Minimal' },
  { id: 'watercolor' as const, label: 'Watercolor' },
  { id: 'oil' as const, label: 'Oil Paint' },
  { id: 'digital' as const, label: 'Digital' },
  { id: 'sketch' as const, label: 'Sketch' },
] as const;

export const PRODUCT_TYPE_MAP: Record<ProductTypeIdTypes, ProductTypeInfoTypes> = {
  tee: {
    blueprintIds: [12, 6], // Bella+Canvas 3001, Gildan 5000
    name: 'Heavy Tee',
    icon: 'lucide:shirt',
    specs: 'Premium Cotton / 500GSM / Box Fit',
    hoverColor: 'hover:bg-brandCyan',
  },
  hoodie: {
    blueprintIds: [145], // Unisex Softstyle T-Shirt
    name: 'Archival Hoodie',
    icon: 'mdi:tshirt-crew',
    specs: 'Brushed Fleece / 650GSM / Oversized',
    hoverColor: 'hover:bg-brandPurple',
  },
  tote: {
    blueprintIds: [553], // Cotton Tote Bag
    name: 'Canvas Tote',
    icon: 'lucide:shopping-bag',
    specs: 'Canvas / 12oz / Reinforced Stitching',
    hoverColor: 'hover:bg-brandOrange',
  },
  poster: {
    blueprintIds: [157], // Kids Heavy Cotton Tee (placeholder for poster category)
    name: 'Giclée Print',
    icon: 'lucide:image',
    specs: 'Matte Finish / 250GSM / Archival',
    hoverColor: 'hover:bg-brandCyan',
  },
} as const;
