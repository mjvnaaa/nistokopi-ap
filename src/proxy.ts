import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Pengalihan demi kenyamanan saja: tamu tanpa cookie sesi dikirim ke Masuk.
 * BUKAN otorisasi. Peran dan kepemilikan dicek ulang di setiap halaman dan server action.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const url = new URL("/masuk", request.url);
  url.searchParams.set("lanjut", request.nextUrl.pathname + request.nextUrl.search);
  url.searchParams.set("pesan", "masuk");

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/seller/:path*", "/admin/:path*", "/akun/:path*"],
};
