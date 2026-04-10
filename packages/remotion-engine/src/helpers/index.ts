import { random } from "remotion";

export const pickDeterministic = <T>(items: T[], seed: string): T => {
  const index = Math.floor(random(seed) * items.length);
  return items[index];
};

export const replaceFirstName = (value: string, studentName: string) => value.replaceAll("{First Name}", studentName);
