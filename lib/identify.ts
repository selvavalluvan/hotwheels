import Anthropic from "@anthropic-ai/sdk";
import type { IdentifiedCar } from "./types";

const SYSTEM_PROMPT = `You identify Hot Wheels 1:64 die-cast cars from a photo of the packaged card or the loose car.
Look for:
- The car's model name, usually printed at the bottom of the blister card (e.g. "'98 SUBARU IMPREZA 22B-STI VERSION", "LOTUS CORTINA").
- The collection/series number in the top right of the card, formatted like "244/250" (index/total for that year's full lineup).
- The collection (series) name, shown as a small badge/icon with text, e.g. "HW: THE '90S", "HW EURO", "90's" with a sub-index like "10/10".
- The dominant body color of the car (e.g. white, red, gold, blue, black).
- Whether this is a "Treasure Hunt" gold-spectraflame variant (look for gold-tone accents, a green "TH" flame logo, or gold rims/spectraflame gold paint). Set is_gold true only if you see clear gold/spectraflame indicators.

Respond with ONLY a JSON object, no markdown fences, no extra text, matching this shape:
{
  "car_name": string,
  "collection_name": string | null,
  "collection_number": string | null,
  "collection_index": number | null,
  "collection_total": number | null,
  "color": string | null,
  "is_gold": boolean,
  "confidence": "high" | "medium" | "low"
}
If the card shows a small series badge like "HW: THE '90S" with its own "10/10" counter, use that badge text as collection_name and its counter as the series sub-index — but collection_number/collection_index/collection_total should come from the overall card number in the corner (e.g. 244/250). If you cannot read a field, use null.`;

export async function identifyCarFromImage(
  base64Image: string,
  mediaType: string
): Promise<IdentifiedCar> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as
                | "image/jpeg"
                | "image/png"
                | "image/webp"
                | "image/gif",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: "Identify this Hot Wheels car and return the JSON described in the system prompt.",
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from model");
  }

  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse identification response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as IdentifiedCar;
  return parsed;
}
