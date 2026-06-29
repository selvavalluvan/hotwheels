import { NextRequest, NextResponse } from "next/server";
import { identifyCarFromImage } from "@/lib/identify";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { HotwheelsRow } from "@/lib/types";

function normalize(s: string | null | undefined) {
  return (s ?? "").trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();
    if (!image || !mediaType) {
      return NextResponse.json(
        { error: "Missing image or mediaType" },
        { status: 400 }
      );
    }

    const identified = await identifyCarFromImage(image, mediaType);
    const supabase = getSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("hotwheels")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const all = (rows ?? []) as HotwheelsRow[];

    const exactMatches = all.filter(
      (r) =>
        normalize(r.car_name) === normalize(identified.car_name) &&
        (identified.collection_number
          ? normalize(r.collection_number) === normalize(identified.collection_number)
          : true)
    );

    const collectionSiblings = identified.collection_name
      ? all.filter(
          (r) =>
            normalize(r.collection_name) === normalize(identified.collection_name) &&
            !exactMatches.some((m) => m.id === r.id)
        )
      : [];

    return NextResponse.json({
      identified,
      already_have: exactMatches.length > 0,
      matches: exactMatches,
      collection_siblings: collectionSiblings,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Check failed" },
      { status: 500 }
    );
  }
}
