"use client";

import { useMemo, useState } from "react";

type EquipmentItem = {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    cost: number;
    quantity_available: number;
};

type CatalogueEditorProps = {
    equipment: EquipmentItem[];
};

type EditFormState = {
    id: number | null;
    name: string;
    description: string;
    category: string;
    cost: string;
    quantity_available: string;
};

export default function CatalogueEditor({ equipment }: CatalogueEditorProps) {
    const [items, setItems] = useState(equipment);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [activeItem, setActiveItem] = useState<EditFormState | null>(null);
    const [isOtherCategory, setIsOtherCategory] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const categories = useMemo(() => {
        return [...new Set(items.map((item) => item.category).filter(Boolean))].sort();
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, categoryFilter]);

    function formatCost(cost: number) {
        return `GBP ${cost.toFixed(2)}`;
    }

    async function handleSave() {
        if (!activeItem) {
            return;
        }

        const cost = Number(activeItem.cost);
        const quantity = Number(activeItem.quantity_available);

        if (!activeItem.name.trim()) {
            setErrorMessage("Item name is required.");
            return;
        }

        if (!activeItem.category.trim()) {
            setErrorMessage("Category is required.");
            return;
        }

        if (Number.isNaN(cost) || cost < 0) {
            setErrorMessage("Cost must be 0 or more.");
            return;
        }

        if (Number.isNaN(quantity) || quantity < 0) {
            setErrorMessage("Quantity must be 0 or more.");
            return;
        }

        setIsSaving(true);
        setErrorMessage("");

        const isNewItem = activeItem.id === null;
        const response = await fetch(isNewItem ? "/api/equipment" : `/api/equipment/${activeItem.id}`, {
            method: isNewItem ? "POST" : "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: activeItem.name,
                description: activeItem.description,
                category: activeItem.category,
                cost,
                quantity_available: quantity,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            setIsSaving(false);
            setErrorMessage(data.error || "Failed to update equipment.");
            return;
        }

        if (isNewItem) {
            setItems((currentItems) =>
                [
                    ...currentItems,
                    {
                        id: data.id,
                        name: data.name,
                        description: data.description,
                        category: data.category,
                        cost: Number(data.cost),
                        quantity_available: data.quantity_available,
                    },
                ].sort((left, right) => left.name.localeCompare(right.name)),
            );
        } else {
            setItems((currentItems) =>
                currentItems.map((item) =>
                    item.id === data.id
                        ? {
                            ...item,
                            name: data.name,
                            description: data.description,
                            category: data.category,
                            cost: Number(data.cost),
                            quantity_available: data.quantity_available,
                        }
                        : item,
                ),
            );
        }

        setIsSaving(false);
        setActiveItem(null);
        setIsOtherCategory(false);
    }

    async function handleDelete() {
        if (!activeItem || activeItem.id === null) {
            return;
        }

        setIsDeleting(true);
        setErrorMessage("");

        const response = await fetch(`/api/equipment/${activeItem.id}`, {
            method: "DELETE",
        });

        const data = await response.json();

        if (!response.ok) {
            setIsDeleting(false);
            setErrorMessage(data.error || "Failed to delete equipment.");
            return;
        }

        setItems((currentItems) => currentItems.filter((item) => item.id !== activeItem.id));
        setIsDeleting(false);
        setActiveItem(null);
        setIsOtherCategory(false);
    }

    return (
        <main className="min-h-screen bg-gray-100 px-6 py-10">
            <div className="mx-auto max-w-7xl rounded-3xl border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                <div className="border-b border-pink-100 bg-pink-50/70 px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Edit Equipment Catalogue</h2>
                            <p className="mt-2 text-gray-600">
                                Update the item name, description, quantity available, and cost directly from the admin catalogue.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_220px_auto]">
                            <input
                                type="text"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by item name"
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            />

                            <select
                                value={categoryFilter}
                                onChange={(event) => setCategoryFilter(event.target.value)}
                                className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                            >
                                <option value="all">All categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category ?? ""}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => {
                                    setActiveItem({
                                        id: null,
                                        name: "",
                                        description: "",
                                        category: "",
                                        cost: "0",
                                        quantity_available: "0",
                                    });
                                    setIsOtherCategory(false);
                                    setErrorMessage("");
                                }}
                                className="rounded-xl bg-[#B80050] px-4 py-2.5 font-semibold text-white transition hover:bg-[#980043]"
                            >
                                Add item
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-50">
                            <tr className="text-sm text-gray-700">
                                <th className="px-4 py-4 text-left font-semibold">Item Name</th>
                                <th className="px-4 py-4 text-left font-semibold">Description</th>
                                <th className="px-4 py-4 text-left font-semibold">Category</th>
                                <th className="px-4 py-4 text-left font-semibold">Cost</th>
                                <th className="px-4 py-4 text-left font-semibold">Quantity Available</th>
                                <th className="px-4 py-4 text-left font-semibold">Edit</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-gray-600">
                                        No equipment matches your search.
                                    </td>
                                </tr>
                            )}

                            {filteredItems.map((item) => (
                                <tr key={item.id} className="border-t border-gray-100 text-sm text-gray-700">
                                    <td className="px-4 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-4 py-4">{item.description || "No description provided."}</td>
                                    <td className="px-4 py-4">{item.category || "Uncategorised"}</td>
                                    <td className="px-4 py-4">{formatCost(item.cost)}</td>
                                    <td className="px-4 py-4">{item.quantity_available}</td>
                                    <td className="px-4 py-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setActiveItem({
                                                    id: item.id,
                                                    name: item.name,
                                                    description: item.description || "",
                                                    category: item.category || "",
                                                    cost: String(item.cost),
                                                    quantity_available: String(item.quantity_available),
                                                });
                                                setIsOtherCategory(Boolean(item.category && !categories.includes(item.category)));
                                                setErrorMessage("");
                                            }}
                                            className="rounded-md bg-[#B80050] px-4 py-2 font-semibold text-white transition hover:bg-[#980043]"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {activeItem && (
                <div className="fixed inset-0 z-120 overflow-y-auto bg-black/55 p-4">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="my-8 flex w-full max-w-2xl max-h-[90vh] flex-col rounded-3xl bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                            <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {activeItem.id === null ? "Add catalogue item" : "Edit catalogue item"}
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        {activeItem.id === null
                                            ? "Add a new item into the equipment catalogue."
                                            : "Update the item details below and save the changes back to the equipment catalogue."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setActiveItem(null);
                                        setIsOtherCategory(false);
                                    }}
                                    className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="mt-6 grid gap-5 overflow-y-auto pr-1">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-gray-900">Item name</span>
                                    <input
                                        type="text"
                                        value={activeItem.name}
                                        onChange={(event) =>
                                            setActiveItem({ ...activeItem, name: event.target.value })
                                        }
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-gray-900">Description</span>
                                    <textarea
                                        value={activeItem.description}
                                        onChange={(event) =>
                                            setActiveItem({ ...activeItem, description: event.target.value })
                                        }
                                        rows={5}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-gray-900">Category</span>
                                    <select
                                        value={isOtherCategory ? "other" : activeItem.category}
                                        onChange={(event) => {
                                            const value = event.target.value;

                                            setIsOtherCategory(value === "other");
                                            setActiveItem({
                                                ...activeItem,
                                                category: value === "other" ? "" : value,
                                            });
                                        }}
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category ?? ""}>
                                                {category}
                                            </option>
                                        ))}
                                        <option value="other">Other</option>
                                    </select>
                                </label>

                                {isOtherCategory && (
                                    <label className="block">
                                        <span className="mb-2 block text-sm font-semibold text-gray-900">Other category</span>
                                        <input
                                            type="text"
                                            value={activeItem.category}
                                            onChange={(event) =>
                                                setActiveItem({ ...activeItem, category: event.target.value })
                                            }
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                        />
                                    </label>
                                )}

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-gray-900">Cost</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={activeItem.cost}
                                        onChange={(event) =>
                                            setActiveItem({
                                                ...activeItem,
                                                cost: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-semibold text-gray-900">Quantity available</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={activeItem.quantity_available}
                                        onChange={(event) =>
                                            setActiveItem({
                                                ...activeItem,
                                                quantity_available: event.target.value,
                                            })
                                        }
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-200"
                                    />
                                </label>
                            </div>

                            {errorMessage && (
                                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                                    {errorMessage}
                                </p>
                            )}

                            <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-gray-200 pt-4">
                                {activeItem.id !== null && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        disabled={isDeleting || isSaving}
                                        className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {isDeleting ? "Deleting..." : "Delete item"}
                                    </button>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveItem(null);
                                            setIsOtherCategory(false);
                                        }}
                                        className="rounded-md border border-gray-400 bg-white px-4 py-2 font-semibold text-gray-900 transition hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSave}
                                        disabled={isSaving || isDeleting}
                                        className="rounded-md bg-[#B80050] px-4 py-2 font-semibold text-white transition hover:bg-[#980043] disabled:opacity-50"
                                    >
                                        {isSaving
                                            ? "Saving..."
                                            : activeItem.id === null
                                                ? "Add item"
                                                : "Save changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
