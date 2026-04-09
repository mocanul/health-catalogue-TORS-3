"use client";

import { useState, useEffect } from "react";
import ErrorModal from "./modals/errorMessage";

type Room = {
    id: number;
    name: string;
    type: string | null;
};

type BookingItem = {
    id: number;
    name: string;
    fixed_room_id: number | null;
    quantity: number;
};

type SelectedBookingSlot = {
    bookingDate: string;
    roomName: string;
    startTime: string;
    endTime: string;
};

type Props = {
    selectedRoom?: Room | null;
    selectedSlot?: SelectedBookingSlot | null;
    isBooking?: boolean;
    onAddItem?: (item: BookingItem) => void;
};

type Equipment = {
    id: number;
    name: string;
    description: string | null;
    category: string | null;
    quantity_available: number;
    is_active: boolean;
    created_at: string;
    fixed_room_id: number | null;
    room: { name: string } | null;
};
type RecentBooking = {
    id: number;
    bookingDate: string;
    roomName: string;
    items: BookingItem[];
};


type KitItemDefinition = {
    name: string;
    quantity: number;
    size?: string;
    aliases?: string[];
};

type KitDefinition = {
    name: string;
    items: KitItemDefinition[];
};

const TABS = [
    "General Equipment",
    "Airway & Theatre",
    "Imaging & Diagnostics",
    "Emergency & Rehab",
    "Specialist Care",
    "Recents",
    "Kits",
    "Favourites",
] as const;

const TAB_CATEGORIES: Record<string, string[]> = {
    "General Equipment": ["Medical Equipment", "Wound Care"],
    "Airway & Theatre": ["Airway & Respiratory Care", "Theatre & Perioperative (ODP)"],
    "Imaging & Diagnostics": ["Imaging & Radiotherapy", "Monitoring & Diagnostics"],
    "Emergency & Rehab": ["Emergency & Pre-hospital (Paramedic)", "MSK", "Patient Manoeuvering"],
    "Specialist Care": ["Midwifery", "Mental Health", "Dietetics", "Nutrition & Anthropometry"],
    "Recents": [],
    "Kits": [],
    "Favourites": [],
};

const KIT_DEFINITIONS: KitDefinition[] = [
    {
        name: "Cannulation Trolley",
        items: [
            { name: "3 way tap with extension", quantity: 1, aliases: ["3-way tap", "3 way tap"] },
            { name: "Alcohol Wipes", quantity: 1, aliases: ["Alchol Wipes"] },
            { name: "Blunt Fill Needle (Red)", quantity: 1, aliases: ["Blunt Fill Needle"] },
            { name: "Cannula - 14G", quantity: 1, aliases: ["Cannulas"] },
            { name: "Cannula - 16G", quantity: 1, aliases: ["Cannulas"] },
            { name: "Cannula - 17G", quantity: 1, aliases: ["Cannulas"] },
            { name: "Cannula - 18G", quantity: 1, aliases: ["Cannulas"] },
            { name: "Cannula - 20G", quantity: 1, aliases: ["Cannulas"] },
            { name: "Cannula - 24G", quantity: 1, aliases: ["Cannulas"] },
            { name: "Cannula Dressing", quantity: 1, aliases: ["Cannula dressings"] },
            { name: "Cotton Wool", quantity: 1 },
            { name: "Gauze", quantity: 1, aliases: ["Gauze Swab"] },
            { name: "Needle (Blue 23G)", quantity: 1, aliases: ["Needles"] },
            { name: "Needle (Green 21G)", quantity: 1, aliases: ["Needles"] },
            { name: "Needle (Orange 25G)", quantity: 1, aliases: ["Needles"] },
            { name: "Needle (Yellow 19G)", quantity: 1, aliases: ["Needles"] },
            { name: "Sample Bottle (Blue)", quantity: 1, aliases: ["Blood Bottle"] },
            { name: "Sample Bottle (Gold)", quantity: 1, aliases: ["Blood Bottle"] },
            { name: "Sample Bottle (Pink)", quantity: 1, aliases: ["Blood Bottle"] },
            { name: "Sample Bottle (Purple)", quantity: 1, aliases: ["Blood Bottle"] },
            { name: "Sample Bottle (Red)", quantity: 1, aliases: ["Blood Bottle"] },
            { name: "Sample Bottle (White)", quantity: 1, aliases: ["Blood Bottle"] },
            { name: "Sample Bottle (Yellow)", quantity: 1, aliases: ["Blood Bottle"] },
            { name: "Syringe (10ml LeurLock)", quantity: 1, aliases: ["Leur Lock Syringes"] },
            { name: "Syringe (5ml LeurLock)", quantity: 1, aliases: ["Leur Lock Syringes"] },
            { name: "Tape", quantity: 1 },
            { name: "Tourniquets", quantity: 1, aliases: ["Tourniquet"] },
            { name: "Vacutainer - Needle (Black 22G)", quantity: 1, aliases: ["Blunt Fill Needle"] },
            { name: "Vacutainer - Needle (Butterfly 21G)", quantity: 1, aliases: ["Butterfly Needle"] },
            { name: "Vacutainer - Needle (Green 21G)", quantity: 1, aliases: ["Needles"] },
            { name: "Vacutainer Holder", quantity: 1, aliases: ["Venepuncture Tube"] },
            { name: "Water (10ml)", quantity: 1, aliases: ["Water Ampule (Sodium Chloride)"] },
        ],
    },
    {
        name: "Paramedic Red Bag",
        items: [
            { name: "Cannulas", quantity: 10, size: "20g" },
            { name: "Syringes", quantity: 4, size: "10ml", aliases: ["Leur Lock Syringes"] },
            { name: "Syringes", quantity: 2, size: "2ml", aliases: ["Leur Lock Syringes"] },
            { name: "Syringe", quantity: 1, size: "1ml", aliases: ["Leur Slip Syringe"] },
            { name: "Mucosal Atomiser Device (MAD)", quantity: 1 },
            { name: "Cannula dressings", quantity: 6, aliases: ["Cannula Dressing"] },
            { name: "Clingfilm", quantity: 1 },
            { name: "Large ambulance dressings", quantity: 2 },
            { name: "Triangular bandages", quantity: 2 },
            { name: "OALES pressure dressing", quantity: 1 },
            { name: "Blast Dressing", quantity: 1 },
            { name: "Chest Seal", quantity: 1 },
            { name: "Trauma Tourniquets", quantity: 2, aliases: ["Tourniquet"] },
            { name: "Tape", quantity: 1 },
            { name: "Assortment of dressings", quantity: 1 },
            { name: "Thomas tube holder", quantity: 1 },
            { name: "Catheter mount and Filter", quantity: 1 },
            { name: "High Flow Oxygen Mask", quantity: 1, size: "Adult" },
            { name: "Heat and moisture exchanging filters (HMEFs)", quantity: 1 },
            { name: "Supraglottic Airway", quantity: 3 },
            { name: "Supraglottic Airway", quantity: 4 },
            { name: "Supraglottic Airway", quantity: 5 },
            { name: "McGill's forceps", quantity: 1, size: "Adult", aliases: ["Magil Forceps"] },
            { name: "Ribbon tie", quantity: 1, aliases: ["Ribbon Gauze"] },
            { name: "Nasopharyngeal Airway (NPA)", quantity: 1, size: "6", aliases: ["Nasopharyngeal Airways"] },
            { name: "Nasopharyngeal Airway (NPA)", quantity: 1, size: "7", aliases: ["Nasopharyngeal Airways"] },
            { name: "Oropharyngeal Airway (OPA)", quantity: 1, size: "2", aliases: ["Oropharyngeal Airway"] },
            { name: "Oropharyngeal Airway (OPA)", quantity: 1, size: "3", aliases: ["Oropharyngeal Airway"] },
            { name: "Oropharyngeal Airway (OPA)", quantity: 1, size: "4", aliases: ["Oropharyngeal Airway"] },
            { name: "Cannula", quantity: 1, size: "20g", aliases: ["Cannulas"] },
            { name: "3-way tap", quantity: 1, aliases: ["3 way tap with extension"] },
            { name: "Oxygen tubing", quantity: 1 },
            { name: "Kendrick Traction Device", quantity: 1, size: "Adult" },
            { name: "Kneck Collar", quantity: 1, size: "Adult", aliases: ["Neck Collar"] },
            { name: "Pelvic Binder", quantity: 1, size: "Adult" },
        ],
    },
    {
        name: "Paramedic Green Bag",
        items: [
            { name: "High Flow Oxygen Mask", quantity: 1, size: "Adult" },
            { name: "Nasal Cannula", quantity: 1, size: "Adult", aliases: ["Ported Cannula"] },
            { name: "Nebuliser Mask", quantity: 1, size: "Adult" },
            { name: "Venturi/Nebuliser Adaptors", quantity: 1 },
            { name: "Sharps Bin", quantity: 1 },
            { name: "Adult Bag, Valve and Mask", quantity: 1, aliases: ["BVM in Bag"] },
            { name: "Stethoscope", quantity: 1 },
            { name: "Manual BP kit", quantity: 1, aliases: ["Syhgmonometers"] },
            { name: "Sphygmomanometer", quantity: 1, aliases: ["Syhgmonometers"] },
            { name: "Blood glucose monitor", quantity: 1 },
            { name: "Thermometer", quantity: 1 },
            { name: "Cannulas", quantity: 10, size: "20g" },
            { name: "Syringes", quantity: 4, size: "10ml", aliases: ["Leur Lock Syringes"] },
            { name: "Syringes", quantity: 2, size: "2ml", aliases: ["Leur Lock Syringes"] },
            { name: "Syringe", quantity: 1, size: "1ml", aliases: ["Leur Slip Syringe"] },
            { name: "Mucosal Atomiser Device (MAD)", quantity: 1 },
            { name: "Cannula dressings", quantity: 6, aliases: ["Cannula Dressing"] },
            { name: "Tourniquet", quantity: 1 },
            { name: "Infusion sets", quantity: 2 },
            { name: "Sodium chloride bag", quantity: 1, aliases: ["NaCl"] },
            { name: "Glucose bag", quantity: 1 },
            { name: "Adrenaline 1:10,000", quantity: 1, aliases: ["Adrenaline"] },
            { name: "Amiodarone", quantity: 2 },
            { name: "McGill's forceps", quantity: 1, size: "Adult", aliases: ["Magil Forceps"] },
            { name: "Thomas tube holder", quantity: 1 },
            { name: "Catheter mount and Filter", quantity: 1 },
            { name: "Laryngoscope handle and blade", quantity: 4, aliases: ["Laryngoscope"] },
            { name: "Ribbon tie", quantity: 1, aliases: ["Ribbon Gauze"] },
            { name: "Nasopharyngeal Airway (NPA)", quantity: 1, size: "6", aliases: ["Nasopharyngeal Airways"] },
            { name: "Nasopharyngeal Airway (NPA)", quantity: 1, size: "7", aliases: ["Nasopharyngeal Airways"] },
            { name: "Supraglottic Airway", quantity: 1, size: "3" },
            { name: "Supraglottic Airway", quantity: 1, size: "4" },
            { name: "Supraglottic Airway", quantity: 1, size: "5" },
            { name: "EZ-IO Kit", quantity: 1, aliases: ["EZ-IO Kit Bag"] },
        ],
    },
    {
        name: "EZ-IO Kit Bag",
        items: [
            { name: "intraosseous (IO) Needle", quantity: 2, size: "45mm", aliases: ["IO Gun"] },
            { name: "Dressing stabiliser", quantity: 2 },
            { name: "Syringe", quantity: 1, size: "20ml", aliases: ["Leur Slip Syringe"] },
            { name: "3-way tap", quantity: 1, aliases: ["3 way tap with extension"] },
            { name: "Cut out of sponge", quantity: 1 },
            { name: "intraosseous (IO) Gun", quantity: 1, aliases: ["IO Gun"] },
            { name: "Extension catheter", quantity: 1, aliases: ["Extension"] },
            { name: "Humerus Bone", quantity: 1 },
            { name: "Tibia bone", quantity: 1, aliases: ["Tibia Bone"] },
        ],
    },
    {
        name: "Vital Signs Trolleys",
        items: [
            { name: "Syhgmonometers", quantity: 1, aliases: ["Sphygmomanometer"] },
            { name: "Automatic BP monitor", quantity: 1 },
            { name: "Pen Tourch", quantity: 1, aliases: ["Pen Torch"] },
            { name: "Stephoscopes", quantity: 1, aliases: ["Stethoscope"] },
            { name: "Measuring Tape", quantity: 1 },
        ],
    },
    {
        name: "Additional Kit",
        items: [
            { name: "BVM in Bag", quantity: 1, aliases: ["Adult Bag, Valve and Mask"] },
            { name: "Defib", quantity: 1 },
            { name: "Suction Unit +Yankauer +Tubing (Ready to go)", quantity: 1 },
            { name: "Leur Slip Syringe", quantity: 1, size: "20ml" },
            { name: "Endotracheal Tube (ETT)", quantity: 1 },
            { name: "Supraglottic Airway", quantity: 1, size: "4 & 5" },
            { name: "Laryngoscope with sizes 3 & 4 blades", quantity: 1, aliases: ["Laryngoscope"] },
            { name: "Magil Forceps", quantity: 1, aliases: ["McGill's forceps"] },
            { name: "Nasopharyngeal Airways", quantity: 1, size: "6 & 7", aliases: ["Nasopharyngeal Airway (NPA)"] },
            { name: "Oropharyngeal Airway", quantity: 1, size: "2, 3 & 4", aliases: ["Oropharyngeal Airway (OPA)"] },
            { name: "Ribbon Gauze", quantity: 1, aliases: ["Ribbon tie"] },
            { name: "ETCO2 Monitor", quantity: 1 },
            { name: "Defib Pads", quantity: 1 },
            { name: "Gloves", quantity: 1, size: "S, M & L" },
            { name: "Mapleson Breathing System", quantity: 1 },
            { name: "Non-Rebreath Mask", quantity: 1 },
            { name: "Razor", quantity: 1 },
            { name: "Stethoscope", quantity: 1 },
            { name: "Tuft Cut Scissors", quantity: 1 },
            { name: "Water Ampule (Sodium Chloride)", quantity: 1, size: "10ml" },
            { name: "3 way tap", quantity: 1, aliases: ["3-way tap"] },
            { name: "Alcohol Wipes", quantity: 1 },
            { name: "Arterial Blood Gas Syringe", quantity: 1 },
            { name: "Blood Bottle", quantity: 1, size: "Red, Pink, Purple, Blue, Gold" },
            { name: "Blunt Fill Needle", quantity: 1 },
            { name: "Butterfly Needle", quantity: 1 },
            { name: "Extension", quantity: 1 },
            { name: "Gauze Swab", quantity: 1, aliases: ["Gauze"] },
            { name: "IV Dressing", quantity: 1 },
            { name: "Leur Lock Syringes", quantity: 1, size: "2ml, 10ml & 20ml" },
            { name: "Needles", quantity: 1, size: "Green & Orange" },
            { name: "Ported Cannula", quantity: 1, size: "Green, Grey & Pink" },
            { name: "Tape", quantity: 1 },
            { name: "Tourniquet", quantity: 1 },
            { name: "Venepuncture Tube", quantity: 1 },
            { name: "IO Gun", quantity: 1, aliases: ["intraosseous (IO) Gun"] },
            { name: "Drugs Box", quantity: 1 },
            { name: "Fluids Box", quantity: 1 },
            { name: "Anaphylaxis & Oversedation Box", quantity: 1 },
            { name: "Adrenaline", quantity: 1, size: "1mg in 10ml" },
            { name: "Amiodarone", quantity: 1, size: "150mg in 10ml" },
            { name: "Atropine", quantity: 1, size: "1mg in 5ml" },
            { name: "Calcium Chloride", quantity: 1, size: "10% in 10ml" },
            { name: "Adrenaline", quantity: 1, size: "1:1000 1mg in 1ml" },
            { name: "Hydrocortisone", quantity: 1, size: "100mg" },
            { name: "Flumazenil", quantity: 1, size: "500micrograms in 5ml" },
            { name: "Chlorphenamine Maleate", quantity: 1, size: "10mg in 1ml" },
            { name: "Naloxone", quantity: 1, size: "400micrograms in 5ml" },
            { name: "Blunt Fill Needle", quantity: 1 },
            { name: "Wide-Bore Giving Sets", quantity: 1 },
            { name: "NaCl", quantity: 1, size: "500ml", aliases: ["Sodium chloride bag"] },
            { name: "Hartmanns Solution", quantity: 1, size: "500ml" },
        ],
    },
];

function normaliseCatalogueName(value: string) {
    return value
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[()'",.+/:-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function formatRecentBookingDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(value));
}

export default function Catalogue({ selectedRoom: _selectedRoom, selectedSlot, isBooking, onAddItem }: Props) {
    const [equipment, setEquipment] = useState<Equipment[]>([]);
    const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("General Equipment");
    const [search, setSearch] = useState("");
    const [favourites, setFavourites] = useState<Set<number>>(new Set());
    const [expandedKits, setExpandedKits] = useState<Set<string>>(new Set([KIT_DEFINITIONS[0].name]));

    useEffect(() => {
        fetch("/api/equipment")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch equipment");
                return res.json();
            })
            .then((data) => setEquipment(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetch("/api/equipment/favourites")
            .then((res) => {
                if (!res.ok) return;
                return res.json();
            })
            .then((ids: number[]) => {
                if (ids) setFavourites(new Set(ids));
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        fetch("/api/equipment/recents")
            .then((res) => {
                if (!res.ok) return;
                return res.json();
            })
            .then((data: RecentBooking[]) => {
                if (data) setRecentBookings(data);
            })
            .catch(() => { });
    }, []);

    const filtered = equipment.filter((item) => {
        if (activeTab === "Favourites") return favourites.has(item.id);
        const matchesTab = TAB_CATEGORIES[activeTab]?.includes(item.category ?? "");
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const filteredKits = KIT_DEFINITIONS.filter((kit) => {
        const term = search.trim().toLowerCase();
        if (!term) return true;

        const matchesKitName = kit.name.toLowerCase().includes(term);
        const matchesItem = kit.items.some((item) => {
            const fields = [item.name, item.size ?? "", ...(item.aliases ?? [])];
            return fields.some((field) => field.toLowerCase().includes(term));
        });

        return matchesKitName || matchesItem;
    });

    const toggleFavourite = async (id: number) => {
        setFavourites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); } else { next.add(id); }
            return next;
        });

        try {
            const res = await fetch("/api/equipment/favourites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ equipment_id: id }),
            });

            if (!res.ok) throw new Error();

            const { favourited } = await res.json();

            setFavourites((prev) => {
                const next = new Set(prev);
                if (favourited) { next.add(id); } else { next.delete(id); }
                return next;
            });
        } catch {
            setFavourites((prev) => {
                const next = new Set(prev);
                if (next.has(id)) { next.delete(id); } else { next.add(id); }
                return next;
            });
        }
    };

    const ensureBookingSlot = () => {
        const hasBookingSlot =
            selectedSlot &&
            selectedSlot.roomName &&
            selectedSlot.bookingDate &&
            selectedSlot.startTime &&
            selectedSlot.endTime;

        if (!hasBookingSlot) {
            setErrorMessage("Please select room, date and time before adding items to booking.");
            return false;
        }

        return true;
    };

    const canUseEquipmentForSelectedSlot = (item: Equipment) => {
        if (item.fixed_room_id !== null) {
            const fixedRoomName = item.room?.name ?? "a specific room";
            if (selectedSlot?.roomName !== fixedRoomName) {
                return `This item can only be used in ${fixedRoomName}. Please select that room to book this item.`;
            }
        }

        return null;
    };

    const handleAddClick = (item: Equipment, quantity = 1) => {
        if (!ensureBookingSlot()) {
            return;
        }

        const validationError = canUseEquipmentForSelectedSlot(item);
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        onAddItem?.({
            id: item.id,
            name: item.name,
            quantity,
            fixed_room_id: item.fixed_room_id,
        });
    };

    const toggleKit = (kitName: string) => {
        setExpandedKits((prev) => {
            const next = new Set(prev);
            if (next.has(kitName)) {
                next.delete(kitName);
            } else {
                next.add(kitName);
            }
            return next;
        });
    };

    const findEquipmentForKitItem = (kitItem: KitItemDefinition) => {
        const searchTerms = [kitItem.name, ...(kitItem.aliases ?? [])].map(normaliseCatalogueName);

        return equipment.find((item) => {
            const equipmentName = normaliseCatalogueName(item.name);
            return searchTerms.some((term) => equipmentName === term || equipmentName.includes(term) || term.includes(equipmentName));
        }) ?? null;
    };

    const handleAddKitItem = (kitItem: KitItemDefinition) => {
        const matchedEquipment = findEquipmentForKitItem(kitItem);
        if (!matchedEquipment) {
            setErrorMessage(`${kitItem.name} is not currently available in the catalogue.`);
            return;
        }

        handleAddClick(matchedEquipment, kitItem.quantity);
    };

    const handleAddFullKit = (kit: KitDefinition) => {
        if (!ensureBookingSlot()) {
            return;
        }

        const missingItems: string[] = [];
        const roomRestrictedItems: string[] = [];

        for (const kitItem of kit.items) {
            const matchedEquipment = findEquipmentForKitItem(kitItem);
            if (!matchedEquipment) {
                missingItems.push(kitItem.name);
                continue;
            }

            const validationError = canUseEquipmentForSelectedSlot(matchedEquipment);
            if (validationError) {
                roomRestrictedItems.push(kitItem.name);
                continue;
            }

            onAddItem?.({
                id: matchedEquipment.id,
                name: matchedEquipment.name,
                quantity: kitItem.quantity,
                fixed_room_id: matchedEquipment.fixed_room_id,
            });
        }

        if (missingItems.length > 0 || roomRestrictedItems.length > 0) {
            const messages: string[] = [];
            if (missingItems.length > 0) {
                messages.push(`These kit items were not found in the catalogue: ${missingItems.join(", ")}.`);
            }
            if (roomRestrictedItems.length > 0) {
                messages.push(`These kit items were skipped because they belong to a different fixed room: ${roomRestrictedItems.join(", ")}.`);
            }
            setErrorMessage(messages.join(" "));
        }
    };

    return (
        <div className="flex justify-center px-6 py-8 w-[75%]">
            <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">

                {/* Tab Bar */}
                <div className="border-b border-gray-200 px-4 flex items-center justify-between">
                    <div className="flex items-center overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-xs whitespace-nowrap border-b-2 transition-colors cursor-pointer ${activeTab === tab
                                    ? "border-[#B80050] text-[#B80050] font-semibold"
                                    : "border-transparent text-gray-500 hover:text-gray-800"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 ml-2 shrink-0">

                        {/* Search box */}
                        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                            <input
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-2.5 py-1 text-xs outline-none w-28"
                            />
                            <div className="px-2 text-gray-400">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="py-16 text-center text-gray-400 text-sm">Loading equipment...</div>
                ) : error ? (
                    <div className="py-16 text-center text-red-400 text-sm">{error}</div>
                ) : activeTab === "Recents" ? (
                    <div className="max-h-170 overflow-y-auto px-4 py-4 space-y-4">
                        {recentBookings.length > 0 ? (
                            recentBookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="rounded-lg border border-gray-200 bg-white overflow-hidden"
                                >
                                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {formatRecentBookingDate(booking.bookingDate)}
                                            </p>
                                            <p className="text-xs text-gray-500">{booking.roomName}</p>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-gray-100">
                                        {booking.items.map((item) => {
                                            const matchedEquipment = equipment.find((equipmentItem) => equipmentItem.id === item.id);

                                            return (
                                                <div
                                                    key={`${booking.id}-${item.id}`}
                                                    className="grid grid-cols-[minmax(0,2fr)_100px_140px] gap-4 items-center px-4 py-3"
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                                    </div>

                                                    <p className="text-xs text-gray-700">x {item.quantity}</p>

                                                    <div className="flex justify-end">
                                                        {isBooking ? (
                                                            <button
                                                                type="button"
                                                                disabled={!matchedEquipment}
                                                                onClick={() => {
                                                                    if (matchedEquipment) {
                                                                        handleAddClick(matchedEquipment, item.quantity);
                                                                    }
                                                                }}
                                                                className={`text-xs font-medium px-4 py-1.5 rounded transition-colors ${matchedEquipment
                                                                    ? "bg-[#B80050] hover:bg-[#9a0044] text-white cursor-pointer"
                                                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                    }`}
                                                            >
                                                                Add item
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-16 text-center text-gray-400 text-sm">
                                No recent approved bookings found.
                            </div>
                        )}
                    </div>
                ) : activeTab === "Kits" ? (
                    <div className="max-h-170 overflow-y-auto px-4 py-4 space-y-4">
                        {filteredKits.length > 0 ? (
                            filteredKits.map((kit) => {
                                const isExpanded = expandedKits.has(kit.name);

                                return (
                                    <div key={kit.name} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                                        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
                                            <button
                                                type="button"
                                                onClick={() => toggleKit(kit.name)}
                                                className="flex min-w-0 items-center gap-3 text-left cursor-pointer"
                                            >
                                                <span className="text-sm text-gray-500">{isExpanded ? "▾" : "▸"}</span>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900">{kit.name}</p>
                                                    <p className="text-xs text-gray-500">{kit.items.length} items</p>
                                                </div>
                                            </button>

                                            {isBooking ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAddFullKit(kit)}
                                                    className="shrink-0 bg-[#B80050] hover:bg-[#9a0044] text-white text-xs font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                                                >
                                                    Add full kit
                                                </button>
                                            ) : null}
                                        </div>

                                        {isExpanded ? (
                                            <div className="divide-y divide-gray-100">
                                                {kit.items.map((kitItem, index) => {
                                                    const matchedEquipment = findEquipmentForKitItem(kitItem);

                                                    return (
                                                        <div
                                                            key={`${kit.name}-${kitItem.name}-${index}`}
                                                            className="grid grid-cols-[minmax(0,2fr)_120px_100px_140px] gap-4 items-center px-4 py-3"
                                                        >
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{kitItem.name}</p>
                                                                {!matchedEquipment ? (
                                                                    <p className="mt-1 text-xs text-amber-600">Not matched to catalogue equipment</p>
                                                                ) : null}
                                                            </div>

                                                            <p className="text-xs text-gray-500">{kitItem.size ?? "—"}</p>
                                                            <p className="text-xs text-gray-700">x {kitItem.quantity}</p>

                                                            <div className="flex justify-end">
                                                                {isBooking ? (
                                                                    <button
                                                                        type="button"
                                                                        disabled={!matchedEquipment}
                                                                        onClick={() => handleAddKitItem(kitItem)}
                                                                        className={`text-xs font-medium px-4 py-1.5 rounded transition-colors ${matchedEquipment
                                                                            ? "bg-[#B80050] hover:bg-[#9a0044] text-white cursor-pointer"
                                                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                                            }`}
                                                                    >
                                                                        Add item
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : null}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-16 text-center text-gray-400 text-sm">
                                No kits found.
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Header row */}
                        <div className="grid grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_170px] gap-4 px-4 py-2 border-b border-gray-200 bg-gray-50 h-10 items-center">
                            <div />
                            <p className="text-xs font-medium text-gra y-500">Item</p>
                            <p className="text-xs font-medium text-gray-500">Category</p>
                            <p className="text-xs font-medium text-gray-500">Availability</p>
                            <p className="text-xs font-medium text-gray-500">Fixed room</p>
                            <div />
                        </div>

                        <div className="divide-y divide-gray-100 max-h-170 overflow-y-auto">
                            {filtered.length > 0 ? (
                                filtered.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-[2rem_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_170px] gap-4 items-center px-4 py-3 rounded-lg shadow-sm border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all bg-white h-14"
                                    >
                                        {/* Favourite Star */}
                                        <button
                                            onClick={() => toggleFavourite(item.id)}
                                            className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                                        >
                                            <svg
                                                width="16" height="16" viewBox="0 0 24 24"
                                                fill={favourites.has(item.id) ? "#facc15" : "none"}
                                                stroke={favourites.has(item.id) ? "#facc15" : "currentColor"}
                                                strokeWidth="1.5"
                                            >
                                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                            </svg>
                                        </button>

                                        {/* Name */}
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>

                                        {/* Category */}
                                        <span className="text-xs bg-pink-50 text-pink-700 border border-pink-200 px-2 py-0.5 rounded-full truncate w-fit">
                                            {item.category ?? "—"}
                                        </span>

                                        {/* Item availability */}
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${item.quantity_available > 0
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-red-50 text-red-500 border border-red-200"
                                            }`}>
                                            {item.quantity_available > 0 ? "Available" : "Unavailable"}
                                        </span>

                                        {/* Fixed Room */}
                                        {item.room ? (
                                            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full truncate w-fit">
                                                {item.room.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300">Any room</span>
                                        )}
                                        {/* Add item to basket button TODO: to be changed to only show whilst booking mode is active */}
                                        <div className="w-42.5 flex justify-end">
                                            {isBooking ? (
                                                <button
                                                    className="bg-[#B80050] hover:bg-[#9a0044] text-white text-xs font-medium px-4 py-1.5 rounded transition-colors cursor-pointer"
                                                    onClick={() => handleAddClick(item)}
                                                >
                                                    Add Item
                                                </button>
                                            ) : (
                                                <div className="w-22.25" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 text-center text-gray-400 text-sm">
                                    {activeTab === "Favourites"
                                        ? "Star an item to add it here."
                                        : "No items found."}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <ErrorModal
                open={errorMessage !== null}
                title="Booking details required"
                message={errorMessage ?? ""}
                buttonText="OK"
                onClose={() => setErrorMessage(null)}
            />
        </div>
    );
}

