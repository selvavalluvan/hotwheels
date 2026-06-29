import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { isSameCar } from "@/lib/match";
import type { HotwheelsRow } from "@/lib/types";

export async function GET() {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("hotwheels")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      car_name,
      collection_name,
      collection_number,
      collection_index,
      collection_total,
      series_number,
      series_index,
      series_total,
      color,
      is_gold,
      notes,
      image,
      mediaType,
    } = body;

    if (!car_name) {
      return NextResponse.json({ error: "car_name is required" }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();

    const { data: existingRows, error: existingError } = await supabase
      .from("hotwheels")
      .select("*");

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    const match = (existingRows as HotwheelsRow[] | null)?.find((r) =>
      isSameCar(r, { car_name, collection_name, collection_number, series_number, color, is_gold: !!is_gold })
    );

    if (match) {
      const { data: updated, error: updateError } = await supabase
        .from("hotwheels")
        .update({ quantity: (match.quantity ?? 1) + 1 })
        .eq("id", match.id)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
      return NextResponse.json({ ...updated, merged: true });
    }

    let image_url: string | null = null;

    if (image && mediaType) {
      const ext = mediaType.split("/")[1] || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const buffer = Buffer.from(image, "base64");
      const { error: uploadError } = await supabase.storage
        .from("hotwheels-photos")
        .upload(fileName, buffer, { contentType: mediaType });

      if (!uploadError) {
        const { data: pub } = supabase.storage
          .from("hotwheels-photos")
          .getPublicUrl(fileName);
        image_url = pub.publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("hotwheels")
      .insert({
        car_name,
        collection_name,
        collection_number,
        collection_index,
        collection_total,
        series_number,
        series_index,
        series_total,
        color,
        is_gold: !!is_gold,
        quantity: 1,
        notes,
        image_url,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Insert failed" },
      { status: 500 }
    );
  }
}
