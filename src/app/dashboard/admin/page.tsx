"use client"
import Navbar from "@/components/Navbar"

export default function AdminDashboard() {
    return (
            <div className="flex h-full flex-col">
                <Navbar showLogout={true} links={[
                    {href: "/dashboard/admin", label: "Activity", primary: true},
                    {href: "/dashboard/admin/catalogue", label: "Order Catalogue"},
                    {href: "/dashboard/admin/editCatalogue", label: "Edit Catalogue"},
                    {href: "/dashboard/admin/users", label: "Users"}
                ]}/>

                <div className="flex border-2 h-full">

                    <div className="flex flex-row h-full border-2 w-full border-amber-400">
                        <div className="w-full border-2 border-red-500">

                        </div>
                        <div className="w-full border-2 border-blue-400">

                        </div>
                    </div>
                </div>
                <div className="h-full border-2 border-green-400">

                </div>
        </div>
    )
}