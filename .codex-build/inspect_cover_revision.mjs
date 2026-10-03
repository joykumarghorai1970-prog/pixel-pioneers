import fs from "node:fs/promises";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";
const finalPath = "C:/Users/ranuk/Documents/PIXEL PIONEEERS/output/pptx/CampusNext_Pitch_Deck_Updated.pptx";
const p = await PresentationFile.importPptx(await FileBlob.load(finalPath));
const snapshot = await p.inspect({kind:"slide,textbox,notes", maxChars:50000});
await fs.writeFile("C:/Users/ranuk/Documents/PIXEL PIONEEERS/.codex-build/CampusNext_Pitch_Deck_Updated_final.inspect.ndjson", snapshot.ndjson);
const png = await p.slides.items[0].export({format:"png", scale:2});
await fs.writeFile("C:/Users/ranuk/Documents/PIXEL PIONEEERS/.codex-build/cover_qc_final_latest.png", new Uint8Array(await png.arrayBuffer()));
console.log(snapshot.ndjson.split("\n").filter(x => x.includes('"slide":1') || x.includes('"id":"sh/ts7md4r2"')).join("\n"));
