import { NextRequest, NextResponse } from "next/server";
import { identifyCarFromImage } from "@/lib/identify";

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();
    if (!image || !mediaType) {
      return NextResponse.json(
        { error: "Missing image or mediaType" },
        { status: 400 }
      );
    }
    const result = await identifyCarFromImage(image, mediaType);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Identification failed" },
      { status: 500 }
    );
  }
}
