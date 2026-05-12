import { extractText, getDocumentProxy } from "unpdf";

function cleanPdfText(raw: string): string {
  return (
    raw
      // fix "gmail. com" / "Next. js" → "gmail.com" / "Next.js"
      .replace(/(\w)\.\s+(\w)/g, "$1.$2")
      // fix hyphenated word broken across lines "produc-\ntion" → "production"
      .replace(/(\w)-\s*\n\s*(\w)/g, "$1$2")
      // collapse multiple spaces
      .replace(/ {2,}/g, " ")
      // add space between lowercase→UPPERCASE transitions (mergedWords)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b(?:[A-Z]\s){2,}[A-Z]\b/g, (match) => match.replace(/\s/g, ""))
      // add space between letters and digits
      .replace(/([a-zA-Z])(\d)/g, "$1 $2")
      .replace(/(\d)([a-zA-Z])/g, "$1 $2")
      .replace(
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}\s-\s(Present|\w+\s\d{4})/g,
        "\nDATE_RANGE: $&\n",
      )
      .trim()
  );
}

export async function pdfToRawText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const pdf = await getDocumentProxy(buffer);
  const { text } = await extractText(pdf, { mergePages: true });

  return cleanPdfText(text);
}
