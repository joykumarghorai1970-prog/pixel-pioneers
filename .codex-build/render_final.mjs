import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const finalPath = "C:/Users/ranuk/Documents/PIXEL PIONEEERS/output/pptx/CampusNext_Pitch_Deck.pptx";
const outDir = "C:/Users/ranuk/Documents/PIXEL PIONEEERS/.codex-build/CampusNext_final_renders";
await fs.mkdir(outDir, {recursive:true});
const p = await PresentationFile.importPptx(await FileBlob.load(finalPath));
const snapshot = await p.inspect({kind:"slide,textbox,shape,image,table,chart,notes,layout", maxChars:50000});
await fs.writeFile("C:/Users/ranuk/Documents/PIXEL PIONEEERS/.codex-build/CampusNext_final_inspect.ndjson", snapshot.ndjson);
for (let i=0;i<p.slides.items.length;i++) {
  const png = await p.slides.items[i].export({format:"png", scale:2});
  await fs.writeFile(path.join(outDir, `slide-${i+1}.png`), new Uint8Array(await png.arrayBuffer()));
}
console.log(`slides=${p.slides.items.length}`);
