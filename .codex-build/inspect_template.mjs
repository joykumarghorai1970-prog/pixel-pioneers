import { FileBlob, PresentationFile } from "@oai/artifact-tool";
import fs from "node:fs/promises";
const sourcePath = "C:/Users/ranuk/Documents/PIXEL PIONEEERS/KBC2026_Pitch_Template.pptx";
const p = await PresentationFile.importPptx(await FileBlob.load(sourcePath));
const snapshot = await p.inspect({kind:"slide,textbox,shape,image,table,chart,notes,layout", maxChars:50000});
await fs.writeFile("C:/Users/ranuk/Documents/PIXEL PIONEEERS/.codex-build/template-inspect.ndjson", snapshot.ndjson);
console.log(snapshot.ndjson);
console.log("SLIDES", p.slides.items.length);
console.log("SIZE", JSON.stringify(p.slideSize));
