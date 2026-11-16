import { Suspense } from "react";
import { AdminFlash, AdminHeader } from "@/components/AdminNav";
import { AdminPager } from "@/components/AdminPager";
import { CatalogSkeleton } from "@/components/CatalogSkeleton";
import { ConfirmActionButton } from "@/components/ConfirmActionButton";
import { StatusBadge } from "@/components/StatusBadge";
import { flashFor } from "@/lib/admin-flash";
import { listUsers } from "@/lib/admin-queries";
import { ADMIN_PAGE_SIZE, ROLE_LABEL, canAssignRole, formatDate, parsePage, parseRole, totalPagesFor } from "@/lib/admin-rules";
import { canChangeUserRole, canDeleteUser, canSetUserStatus } from "@/lib/authz";
import type { SearchParams } from "@/lib/catalog";
import { requireAdmin } from "@/lib/guards";
import { hapusPenggunaAction, ubahPeranAction, ubahStatusPenggunaAction } from "../actions";

export const metadata = { title: "Pengguna" };

export default function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

async function Content({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const actor = await requireAdmin("/admin/pengguna");
  const params = await searchParams;

  const q = one(params.q).trim().slice(0, 80);
  const role = parseRole(one(params.peran)) ?? "";
  const page = parsePage(params.halaman);

  const { items, total, activeAdminCount } = await listUsers({ q, role, page });
  const totalPages = totalPagesFor(total, ADMIN_PAGE_SIZE);

  const query = new URLSearchParams();
  if (q) query.set("q", q);
  if (role) query.set("peran", role);
  if (page > 1) query.set("halaman", String(page));
  const here = query.toString() ? `/admin/pengguna?${query.toString()}` : "/admin/pengguna";

  return (
    <>
      <AdminHeader current="pengguna" title="Pengguna" lead="Cari akun, ubah peran admin dan pembeli, nonaktifkan, atau hapus." />
      <AdminFlash flash={flashFor(params.info)} />

      <form className="search-row" method="get" action="/admin/pengguna" role="search" aria-label="Cari pengguna">
        <div className="field">
          <label htmlFor="q">Nama atau email</label>
          <input id="q" name="q" type="search" defaultValue={q} maxLength={80} autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="peran">Peran</label>
          <select id="peran" name="peran" defaultValue={role}>
            <option value="">Semua peran</option>
            <option value="ADMIN">Admin</option>
            <option value="SELLER">Penjual</option>
            <option value="BUYER">Pembeli</option>
          </select>
        </div>
        <button className="btn" type="submit">
          Cari
        </button>
      </form>

      <p className="count" aria-live="polite">
        {total.toLocaleString("id-ID")} pengguna
      </p>

      {items.length === 0 ? (
        <div className="empty">
          <p>Tidak ada pengguna yang cocok.</p>
          {q || role ? (
            <p>
              <a className="btn alt" href="/admin/pengguna">
                Hapus filter
              </a>
            </p>
          ) : null}
        </div>
      ) : (
        <div className="tbl wide">
          <table>
            <caption className="sr">Daftar pengguna</caption>
            <thead>
              <tr>
                <th scope="col">Pengguna</th>
                <th scope="col">Peran</th>
                <th scope="col">Status akun</th>
                <th scope="col">Toko</th>
                <th scope="col">Terdaftar</th>
                <th scope="col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((user) => {
                const isSelf = user.id === actor.id;
                const nextRole = user.role === "ADMIN" ? "BUYER" : "ADMIN";
                const nextStatus = user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
                const fields = { id: user.id, kembali: here };

                const showRole =
                  !isSelf &&
                  canAssignRole({ role: user.role, hasSellerProfile: !!user.store }, nextRole) &&
                  canChangeUserRole(actor, user, nextRole, activeAdminCount);
                const showStatus = !isSelf && canSetUserStatus(actor, user, nextStatus, activeAdminCount);
                const showDelete = canDeleteUser(actor, user, activeAdminCount);
                const lastAdmin = user.role === "ADMIN" && user.status === "ACTIVE" && activeAdminCount <= 1;

                return (
                  <tr key={user.id}>
                    <td>
                      <b>{user.name}</b>
                      <span className="cell-sub">{user.email}</span>
                    </td>
                    <td>{ROLE_LABEL[user.role]}</td>
                    <td>
                      <span className={`tag ${user.status === "ACTIVE" ? "ok" : "bad"}`}>{user.status === "ACTIVE" ? "Aktif" : "Dinonaktifkan"}</span>
                    </td>
                    <td>
                      {user.store ? (
                        <>
                          {user.store.name} <StatusBadge status={user.store.approvalStatus} />
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      {isSelf ? (
                        <span className="note">Akun Anda</span>
                      ) : (
                        <div className="act-wrap">
                          {showRole ? (
                            <ConfirmActionButton
                              label={nextRole === "ADMIN" ? "Jadikan admin" : "Jadikan pembeli"}
                              ariaLabel={`${nextRole === "ADMIN" ? "Jadikan admin" : "Jadikan pembeli"}: ${user.name}`}
                              title="Ubah peran?"
                              message={
                                nextRole === "ADMIN"
                                  ? `${user.name} akan mendapat akses penuh ke area admin.`
                                  : `${user.name} tidak lagi memiliki akses admin dan menjadi pembeli.`
                              }
                              confirmLabel={nextRole === "ADMIN" ? "Ya, jadikan admin" : "Ya, jadikan pembeli"}
                              action={ubahPeranAction}
                              fields={{ ...fields, peran: nextRole }}
                            />
                          ) : null}

                          {showStatus && user.status === "ACTIVE" ? (
                            <ConfirmActionButton
                              label="Nonaktifkan"
                              ariaLabel={`Nonaktifkan ${user.name}`}
                              title="Nonaktifkan pengguna?"
                              message={`${user.name} langsung tidak dapat masuk atau memakai akun pada permintaan berikutnya${
                                user.store ? ", dan produk tokonya disembunyikan dari katalog" : ""
                              }.`}
                              confirmLabel="Ya, nonaktifkan"
                              action={ubahStatusPenggunaAction}
                              fields={{ ...fields, status: "SUSPENDED" }}
                              danger
                            />
                          ) : null}

                          {showStatus && user.status === "SUSPENDED" ? (
                            <form action={ubahStatusPenggunaAction}>
                              <input type="hidden" name="id" value={user.id} />
                              <input type="hidden" name="status" value="ACTIVE" />
                              <input type="hidden" name="kembali" value={here} />
                              <button className="btn alt sm" type="submit" aria-label={`Aktifkan ${user.name}`}>
                                Aktifkan
                              </button>
                            </form>
                          ) : null}

                          {showDelete ? (
                            <ConfirmActionButton
                              label="Hapus"
                              ariaLabel={`Hapus ${user.name}`}
                              title="Hapus pengguna?"
                              message={`Akun “${user.name}” dihapus beserta sesi, favorit, dan ulasannya${
                                user.store ? ", juga tokonya dan semua produknya" : ""
                              }. Tindakan ini tidak dapat dibatalkan.`}
                              confirmLabel="Ya, hapus"
                              action={hapusPenggunaAction}
                              fields={fields}
                              danger
                            />
                          ) : null}

                          {lastAdmin ? <span className="note">Admin aktif terakhir</span> : null}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminPager basePath="/admin/pengguna" params={{ q, peran: role }} page={page} totalPages={totalPages} label="Paginasi pengguna" />
    </>
  );
}
