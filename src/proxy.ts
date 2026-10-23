import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Oturum çerezlerini yeniler ve oturumsuz kullanıcıyı giriş sayfasına yönlendirir.
// Rol kontrolü sayfa/layout'larda requireRole() ile, asıl güvenlik RLS'dedir.

/** Oturum gerektiren panel alanları ve giriş sayfaları (diğer adresler serbest; yoksa 404) */
const PROTECTED: { prefix: string; login: string }[] = [
  { prefix: "/kurucu", login: "/kurucu/giris" },
  { prefix: "/egitmen", login: "/giris/egitmen" },
  { prefix: "/ogrenci", login: "/giris/ogrenci" },
];

function loginPathFor(pathname: string): string | null {
  if (pathname === "/kurucu/giris") return null;
  const area = PROTECTED.find((p) => pathname === p.prefix || pathname.startsWith(`${p.prefix}/`));
  return area?.login ?? null;
}

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

  const login = loginPathFor(request.nextUrl.pathname);

  if (!isLoggedIn && login) {
    const url = request.nextUrl.clone();
    url.pathname = login;
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
