import Link from "next/link";

interface Props {
  basePath: string;
  /** Parameter URL selain halaman (kosong diabaikan). */
  params?: Record<string, string>;
  page: number;
  totalPages: number;
  label: string;
}

function href(basePath: string, params: Record<string, string>, page: number): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  if (page > 1) query.set("halaman", String(page));

  const text = query.toString();
  return text ? `${basePath}?${text}` : basePath;
}

/** Paginasi: "Sebelumnya", "Halaman 2 dari 5", "Berikutnya" (bukan nomor berderet). */
export function AdminPager({ basePath, params = {}, page, totalPages, label }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pager" aria-label={label}>
      {page > 1 ? (
        <Link className="btn alt sm" href={href(basePath, params, page - 1)} rel="prev">
          Sebelumnya
        </Link>
      ) : (
        <span />
      )}
      <span>
        Halaman {page} dari {totalPages}
      </span>
      {page < totalPages ? (
        <Link className="btn alt sm" href={href(basePath, params, page + 1)} rel="next">
          Berikutnya
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
