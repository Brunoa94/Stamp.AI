import { CustomProductSchema } from "@/schemas/printify";
import z from "zod";

export type CustomProductT = z.infer<typeof CustomProductSchema>;