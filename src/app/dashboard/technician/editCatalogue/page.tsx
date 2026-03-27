import Navbar from "@/components/Navbar";
import CatalogueEditor from "@/components/catalogueEditor";
import { prisma } from "@/lib/prisma";

export default async function Home() {
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
      <Navbar showLogout={true} links={[
        { href: "/dashboard/technician", label: "Home" },
        { href: "/dashboard/technician/bookings", label: "Bookings" },
        { href: "/dashboard/technician/catalogue", label: "Order Catalogue" },
        { href: "/dashboard/technician/editCatalogue", label: "Edit Catalogue", primary: true }
      ]} />

      <CatalogueEditor equipment={equipment} />
    </div>
  );
}