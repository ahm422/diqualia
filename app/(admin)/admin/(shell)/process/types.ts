export type ProcessPageData = {
  id: number;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
  headlineLine3: string;
  body: string;
  whereNextEyebrow: string;
  whereNextTitle1: string;
  whereNextTitle2: string;
  whereNextBody: string;
} | null;

export type ProcessStepData = {
  id: number;
  stepLabel: string;
  stepNumber: string;
  title: string;
  body: string;
  order: number;
};
