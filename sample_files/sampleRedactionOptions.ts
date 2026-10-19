import { RedactionMode } from "@microblink/blinkcard-react-native";

export const REDACTION_MODES: readonly RedactionMode[] = [
  RedactionMode.None,
  RedactionMode.ImageOnly,
  RedactionMode.ResultFieldsOnly,
  RedactionMode.FullResult,
];
