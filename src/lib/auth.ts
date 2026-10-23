import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";

export type UserRole = Enums<"user_role">;

export type CurrentProfile = {
  id: string;
  role: UserRole;
  fullName: string;
  email: string | null;
};

export const ROLE_HOME: Record<UserRole, string> = {
  founder: "/kurucu",
  tutor: "/egitmen",
  student: "/ogrenci",
};

/** İstek başına bir kez: oturumdaki aktif kullanıcının profili (yoksa null). */
export const getCurrentProfile = cache(async (): Promise<CurrentProfile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, full_name, email, is_active")
    .eq("id", userId)
    .maybeSingle();
  if (!profile || !profile.is_active) return null;

  return { id: profile.id, role: profile.role, fullName: profile.full_name, email: profile.email };
});

/** Sayfayı yalnızca verilen role açar; değilse doğru yere yönlendirir. */
export async function requireRole(role: UserRole): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(role === "founder" ? "/kurucu/giris" : "/giris");
  if (profile.role !== role) redirect(ROLE_HOME[profile.role]);
  return profile;
}
