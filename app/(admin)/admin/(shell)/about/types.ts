export type AboutHero = { id: number; eyebrow: string; headline: string; body: string } | null;
export type BuiltForSection = {
  id: number;
  eyebrow: string;
  headlineLine1: string;
  headlineLine2: string;
} | null;
export type BuiltForItem = { id: number; title: string; description: string; order: number };
export type AboutWhereNext = {
  id: number;
  eyebrow: string;
  headline: string;
  btn1Label: string;
  btn1Href: string;
  btn2Label: string;
  btn2Href: string;
} | null;
