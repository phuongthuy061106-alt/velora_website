import { getServiceSupabase } from "./supabase";

let cacheSlugToId: Record<string, number> | null = null;
let cacheIdToSlug: Record<number, string> | null = null;

export async function getRoomMapping() {
  if (cacheSlugToId && cacheIdToSlug) {
    return { slugToId: cacheSlugToId, idToSlug: cacheIdToSlug };
  }

  const supabase = getServiceSupabase();
  const { data: rooms } = await supabase
    .from("loai_phong")
    .select("ma_loai_phong, ten_loai_phong");

  const slugToId: Record<string, number> = {};
  const idToSlug: Record<number, string> = {};

  if (rooms && rooms.length > 0) {
    for (const r of rooms) {
      const name = r.ten_loai_phong.toLowerCase();
      let slug = "superior";
      if (name.includes("deluxe")) slug = "deluxe-mountain-view";
      else if (name.includes("family")) slug = "family-room";
      else if (name.includes("suite") || name.includes("executive")) slug = "executive-suite";

      slugToId[slug] = r.ma_loai_phong;
      idToSlug[r.ma_loai_phong] = slug;
    }
  } else {
    // Fallback mặc định theo thứ tự 4 phòng
    return {
      slugToId: { "superior": 1, "deluxe-mountain-view": 2, "family-room": 3, "executive-suite": 4 },
      idToSlug: { 1: "superior", 2: "deluxe-mountain-view", 3: "family-room", 4: "executive-suite" },
    };
  }

  cacheSlugToId = slugToId;
  cacheIdToSlug = idToSlug;
  return { slugToId, idToSlug };
}