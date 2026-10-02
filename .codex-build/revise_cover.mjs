import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "C:/Users/ranuk/Documents/PIXEL PIONEEERS";
const sourcePath = path.join(workspaceDir, "output", "pptx", "CampusNext_Pitch_Deck_Updated.pptx");
const candidatePath = path.join(workspaceDir, ".codex-build", "CampusNext_Pitch_Deck_v3_candidate.pptx");
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));

presentation.slides.items[0].speakerNotes.textFrame.setText(
  "Sources: CampusNext_PRD.md, CampusNext_System_Flow.md, CampusNext_UIUX.md. The repository URL remains a fill-in field."
);

await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
console.log(candidatePath);
