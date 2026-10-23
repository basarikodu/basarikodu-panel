import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Davet / kurtarma e-postası şablonu token_hash ile buraya gelir:
// {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}/sifre-belirle`);
  }
  return NextResponse.redirect(`${origin}/?hata=baglanti`);
}
