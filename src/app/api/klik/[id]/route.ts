import { NextResponse } from "next/server";
import { getClickTarget, recordOrderClick } from "@/lib/queries";
import { isSafeWaLink, waLink } from "@/lib/whatsapp";

/**
 * Catat klik "Pesan lewat WhatsApp" lalu alihkan ke nomor toko.
 * Kegagalan mencatat (atau membaca database) tidak boleh menghalangi pembeli membuka WhatsApp,
 * jadi tautan `wa` yang sudah divalidasi dipakai sebagai cadangan.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = new URL(request.url);
  const fallback = url.searchParams.get("wa") ?? "";

  try {
    const product = await getClickTarget(id);

    if (product) {
      try {
        await recordOrderClick(id);
      } catch (error) {
        console.error("Gagal mencatat klik WhatsApp", error);
      }

      return NextResponse.redirect(waLink(product, product.whatsapp), 302);
    }
  } catch (error) {
    console.error("Gagal membaca produk untuk klik WhatsApp", error);
  }

  if (isSafeWaLink(fallback)) return NextResponse.redirect(fallback, 302);

  return NextResponse.redirect(new URL("/?pesan=produk-tidak-ditemukan", url), 303);
}
