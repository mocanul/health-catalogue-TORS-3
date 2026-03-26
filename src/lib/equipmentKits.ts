// Equipment kit definitions
// Each kit contains exactly 5 equipment IDs from the catalogue.
// Replace the placeholder IDs below with real equipment IDs from your database.

export type EquipmentKit = {
    id: string;
    name: string;
    description: string;
    itemIds: [number, number, number, number, number]; // exactly 5 items
};

export const EQUIPMENT_KITS: EquipmentKit[] = [
    {
        id: "kit_general_assessment",
        name: "General Assessment Kit",
        description: "Core items for a standard patient assessment.",
        itemIds: [1, 2, 3, 4, 5], // TODO: replace with real equipment IDs
    },
    {
        id: "kit_wound_care",
        name: "Wound Care Kit",
        description: "Essential equipment for wound management and dressing.",
        itemIds: [6, 7, 8, 9, 10], // TODO: replace with real equipment IDs
    },
    {
        id: "kit_airway_management",
        name: "Airway Management Kit",
        description: "Airway and respiratory equipment for clinical scenarios.",
        itemIds: [11, 12, 13, 14, 15], // TODO: replace with real equipment IDs
    },
];
