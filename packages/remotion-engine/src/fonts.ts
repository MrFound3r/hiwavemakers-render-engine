// src/packages/remotion-engine/src/fonts.ts
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

console.log(
  `🚀 ~ staticFile("fonts/GillSans-ExtCondensed-Bold.ttf"):`,
  staticFile("fonts/GillSans-ExtCondensed-Bold.ttf"),
);

const url = staticFile("fonts/GillSans-ExtCondensed-Bold.ttf");

fetch(url)
  .then(async (res) => {
    console.log("font fetch", res.status, res.url, await res.blob().then((b) => b.size));
  })
  .catch((err) => {
    console.error("font fetch failed", err);
  });

export const gillSans = loadFont({
  family: "GillSansCustom",
  url: staticFile("fonts/GillSans-ExtCondensed-Bold.ttf"),
  weight: "700",
  style: "normal",
  format: "truetype",
  display: "swap",
});
