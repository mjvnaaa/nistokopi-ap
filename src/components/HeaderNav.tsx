import { getActor } from "@/lib/actor";
import { MainNav, type NavLink } from "@/components/MainNav";

const ROLE_LABEL = { ADMIN: "Admin", SELLER: "Penjual", BUYER: "Pembeli" } as const;

/** Menu menurut peran (UI-SPEC-v2 bagian 1). Tautan Favorit ditambahkan saat halamannya ada. */
export async function HeaderNav() {
  const actor = await getActor();
  const links: NavLink[] = [{ href: "/", label: "Katalog" }];

  if (actor?.role === "SELLER") links.push({ href: "/seller", label: "Dashboard toko" });
  if (actor?.role === "ADMIN") links.push({ href: "/admin", label: "Admin" });

  return <MainNav links={links} user={actor ? { name: actor.name, roleLabel: ROLE_LABEL[actor.role] } : null} />;
}
