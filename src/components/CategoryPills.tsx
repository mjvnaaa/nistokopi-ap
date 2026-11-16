import Link from "next/link";
import { catalogHref, type CatalogFilters } from "@/lib/catalog";
import type { CategoryCount } from "@/lib/queries";

interface Props {
  basePath: string;
  filters: CatalogFilters;
  categories: CategoryCount[];
  total: number;
}

export function CategoryPills({ basePath, filters, categories, total }: Props) {
  return (
    <fieldset className="catbar">
      <legend className="sr">Kategori</legend>
      <div className="cat-list">
        <Link
          className="pill"
          href={catalogHref(basePath, filters, { kategori: "", halaman: 1 })}
          aria-current={filters.kategori ? undefined : "page"}
        >
          Semua <span className="pill-count">({total})</span>
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            className="pill"
            href={catalogHref(basePath, filters, { kategori: category.slug, halaman: 1 })}
            aria-current={filters.kategori === category.slug ? "page" : undefined}
          >
            {category.name} <span className="pill-count">({category.count})</span>
          </Link>
        ))}
      </div>
    </fieldset>
  );
}
