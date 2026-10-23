import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Oturum çerezlerini yeniler ve oturumsuz kullanıcıyı giriş sayfasına yönlendirir.
// Rol kontrolü sayfa/layout'larda requireRole() ile, asıl güvenlik RLS'dedir.

const PUBLIC_PATHS = ["/", "/giris", "/kurucu/giris", "/sifremi-unuttum", "/vitrin"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // getClaims oturumu doğrular ve gerekirse token'ı yeniler.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims?.sub);

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/auth/");

  if (!isLoggedIn && !isPublic && pathname !== "/sifre-belirle") {
    const url = request.nextUrl.clone();
    url.pathname = pathname.startsWith("/kurucu") ? "/kurucu/giris" : "/giris";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
