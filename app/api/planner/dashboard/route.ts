import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase/auth-helpers";
import { supabase } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  const { user, response } = await requireAuth(req);
  if (response) return response;

  const { data: profile } = await supabase
    .from("planner_profiles")
    .select("id, display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({
      stats: { totalClients: 0, activeWeddings: 0, upcomingThisMonth: 0, pendingTasks: 0 },
      upcomingWeddings: [],
      recentActivity: [],
    });
  }

  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  const today = now.toISOString().split("T")[0];

  const [{ data: allWeddings }, { data: tasks }] = await Promise.all([
    supabase
      .from("planner_weddings")
      .select("*")
      .eq("planner_id", profile.id)
      .order("wedding_date", { ascending: true }),
    supabase
      .from("planner_tasks")
      .select("*")
      .eq("planner_id", profile.id)
      .eq("status", "pending"),
  ]);

  const weddings = allWeddings ?? [];
  const activeWeddings = weddings.filter((w) => w.status === "active");
  const upcomingThisMonth = weddings.filter(
    (w) => w.wedding_date >= today && w.wedding_date <= monthEnd,
  );

  const upcomingNext5 = weddings
    .filter((w) => w.wedding_date && w.wedding_date >= today)
    .slice(0, 5);

  return NextResponse.json({
    stats: {
      totalClients: weddings.length,
      activeWeddings: activeWeddings.length,
      upcomingThisMonth: upcomingThisMonth.length,
      pendingTasks: (tasks ?? []).length,
    },
    upcomingWeddings: upcomingNext5,
    recentActivity: [],
  });
}
