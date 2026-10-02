import { FileBlob, PresentationFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";
const sourcePath = "C:/Users/ranuk/Documents/PIXEL PIONEEERS/KBC2026_Pitch_Template.pptx";
const outDir = "C:/Users/ranuk/Documents/PIXEL PIONEEERS/.codex-build/template-renders";
await fs.mkdir(outDir, {recursive:true});
const p = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
for (let i=0;i<p.slides.items.length;i++) {
  const slide = p.slides.items[i];
  const png = await slide.export({format:"png", scale:2});
  await fs.writeFile(`${outDir}/slide-${i+1}.png`, new Uint8Array(await png.arrayBuffer()));
}
console.log('rendered', p.slides.items.length);
