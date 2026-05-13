import crypto from "crypto";

export function generateHash(rawText: string, parsedTargetRole: string) {
  return crypto
    .createHash("sha256")
    .update(rawText + parsedTargetRole)
    .digest("hex");
}