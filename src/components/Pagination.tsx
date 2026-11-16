import Link from "next/link";
import { pageHref, type CatalogFilters } from "@/lib/catalog";

interface Props {
  basePath: string;
  filters: CatalogFilters;
  page: number;
  totalPages: number;
}

export function Pagination({ basePath, filters, page, totalPages }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pager" aria-label="Paginasi katalog">
      {page > 1 ? (
        <Link className="btn alt sm" href={pageHref(basePath, filters, page - 1)} rel="prev">
          Sebelumnya
        </Link>
      ) : (
        <span />
      )}
      <span>
        Halaman {page} dari {totalPages}
      </span>
      {page < totalPages ? (
        <Link className="btn alt sm" href={pageHref(basePath, filters, page + 1)} rel="next">
          Berikutnya
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
