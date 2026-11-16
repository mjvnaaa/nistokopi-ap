import { Suspense } from "react";
import { AdminHeader } from "@/components/AdminNav";
import { AdminPager } from "@/components/AdminPager";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { listAuditLog } from "@/lib/admin-queries";
import { LOG_PAGE_SIZE, auditLabel, describeMeta, formatDate, parsePage, totalPagesFor } from "@/lib/admin-rules";
import type { SearchParams } from "@/lib/catalog";
import { requireAdmin } from "@/lib/guards";

export const metadata = { title: "Audit log" };

export default function AdminLogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin("/admin/log");
  const page = parsePage((await searchParams).halaman);

  const { items, total } = await listAuditLog(page);
  const totalPages = totalPagesFor(total, LOG_PAGE_SIZE);

  return (
    <>
      <AdminHeader current="log" title="Audit log" lead="Riwayat aksi admin, terbaru di atas. Log hanya dapat dibaca dan tidak dapat diubah dari aplikasi." />

      <p className="count" aria-live="polite">
        {total.toLocaleString("id-ID")} catatan
      </p>

      {items.length === 0 ? (
        <div className="empty">Belum ada aksi admin yang tercatat.</div>
      ) : (
        <div className="tbl wide">
          <table>
            <caption className="sr">Audit log aksi admin</caption>
            <thead>
              <tr>
                <th scope="col">Waktu</th>
                <th scope="col">Pelaku</th>
                <th scope="col">Aksi</th>
                <th scope="col">Sasaran</th>
                <th scope="col">Rincian</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.createdAt, true)}</td>
                  <td>{row.actorName ?? "Akun sudah dihapus"}</td>
                  <td>{auditLabel(row.action)}</td>
                  <td>{row.entityType}</td>
                  <td className="cell-clip">{describeMeta(row.meta) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminPager basePath="/admin/log" page={page} totalPages={totalPages} label="Paginasi audit log" />
    </>
  );
}
