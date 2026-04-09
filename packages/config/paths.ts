// packages/config/paths.ts
import path from "node:path";

export const paths = {
  storage: path.resolve(process.cwd(), "../../storage"),
  renders: path.resolve(process.cwd(), "../../storage/renders"),
  recordings: path.resolve(process.cwd(), "../../storage/recordings"),
};
