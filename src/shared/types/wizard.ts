/**
 * Wizard workflow step types
 * Used across the wizard UI components and step configuration
 */

export type WizardStepT =
  | "upload"
  | "form"
  | "synthesis"
  | "generating"
  | "review"
  | "results"
  | "fabric"
  | "customizing"
  | "creating"
  | "sizing"
  | "created";

/**
 * Configuration for each wizard step
 * Defines display properties and navigation behavior
 */
export interface StepConfig {
  number: string;
  title: string;
  description: string;
  dotIndex: number;
}
