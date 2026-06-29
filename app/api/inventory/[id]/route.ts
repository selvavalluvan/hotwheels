import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("hotwheels")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  return NextResponse.json(data);
}

const EDITABLE_FIELDS = [
  "car_name",
  "collection_name",
  "collection_number",
  "collection_index",
  "collection_total",
  "series_number",
  "series_index",
  "series_total",
  "color",
  "is_gold",
  "quantity",
  "notes",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) updates[field] = body[field];
  }

  if ("quantity" in updates && (typeof updates.quantity !== "number" || updates.quantity < 1)) {
    return NextResponse.json({ error: "quantity must be a positive number" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("hotwheels")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("hotwheels").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
