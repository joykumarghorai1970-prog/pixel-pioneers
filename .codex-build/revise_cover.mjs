import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "C:/Users/ranuk/Documents/PIXEL PIONEEERS";
const sourcePath = path.join(workspaceDir, "output", "pptx", "CampusNext_Pitch_Deck_Updated.pptx");
const candidatePath = path.join(workspaceDir, ".codex-build", "CampusNext_Pitch_Deck_v4_candidate.pptx");
const presentation = await PresentationFile.importPptx(await FileBlob.load(sourcePath));

const coverDetails = presentation.resolve("sh/ts7md4r2");
coverDetails.text.replace("[add URL]", "https://github.com/joykumarghorai1970-prog/pixel-pioneers.git");
presentation.slides.items[0].speakerNotes.textFrame.setText(
  "Sources: CampusNext_PRD.md, CampusNext_System_Flow.md, CampusNext_UIUX.md. Project repository: https://github.com/joykumarghorai1970-prog/pixel-pioneers.git"
);

await (await PresentationFile.exportPptx(presentation)).save(candidatePath);
console.log(candidatePath);
