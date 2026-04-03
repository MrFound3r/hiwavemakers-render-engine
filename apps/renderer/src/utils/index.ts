import fs from "fs";

export function buildUrl(relativePath: string) {
  return `${process.env.DOMAIN}:${process.env.PORT || 4000}${relativePath}`;
}

export function getFiles(dir: string, extensions: RegExp): string[] {
  try {
    const files = fs.readdirSync(dir);

    return files.filter((file) => extensions.test(file));
  } catch (err) {
    console.error(`Failed to read directory: ${dir}`, err);
    return [];
  }
}
