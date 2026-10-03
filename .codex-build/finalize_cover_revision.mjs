import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const skillDir = "C:/Users/ranuk/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations";
const workspaceDir = "C:/Users/ranuk/Documents/PIXEL PIONEEERS";
const candidatePath = path.join(workspaceDir, ".codex-build", "CampusNext_Pitch_Deck_v4_candidate.pptx");
const finalPath = path.join(workspaceDir, "output", "pptx", "CampusNext_Pitch_Deck_Updated.pptx");
const stagingDir = path.join(workspaceDir, ".codex-finalizer");
await fs.mkdir(stagingDir, { recursive: true });

const presentation = await PresentationFile.importPptx(await FileBlob.load(candidatePath));
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools/artifact_tool_utils.mjs")).href);
const templatePath = path.join(workspaceDir, "KBC2026_Pitch_Template.pptx");
const result = await finalizePresentation({
  explicitTotalSlideCount: 7,
  sourceTemplatePath: templatePath,
  requiredTemplateReferenceSlides: [1, 2, 3, 4, 5, 6, 7],
  minimumTemplateCoverageRatio: 1,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: "C:/Users/ranuk/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe",
  integrityValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "9144000,5143500", "--validate-bullet-geometry", "--validate-heading-fit"],
  fontPolicy: {
    basis: "reference",
    families: ["Georgia", "Calibri"],
    referencePath: templatePath,
    referenceSha256: "a29412a160e99d32b51b9311ad4f582eed5334c64d7a80e33544a4f30485bf90",
  },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, `${path.basename(finalPath)}.validation-v4.json`),
});
console.log(JSON.stringify(result, null, 2));
