import CatalogueEditor from "@/components/catalogueEditor";
import Navbar from "@/components/Navbar";
import { prisma } from "@/lib/prisma";

export default async function EditCataloguePage() {
  const equipment = await prisma.equipment.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      cost: true,
      quantity_available: true,
    },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        showLogout={true}
        links={[
          { href: "/dashboard/admin", label: "Activity" },
          { href: "/dashboard/admin/bookings", label: "Bookings" },
          { href: "/dashboard/admin/catalogue", label: "Order Catalogue" },
          { href: "/dashboard/admin/editCatalogue", label: "Edit Catalogue", primary: true },
          { href: "/dashboard/admin/audit-logs", label: "Audit Logs" },
          { href: "/dashboard/admin/users", label: "Users" },
        ]}
      />

      <CatalogueEditor equipment={equipment} />
    </div>
  );
}
