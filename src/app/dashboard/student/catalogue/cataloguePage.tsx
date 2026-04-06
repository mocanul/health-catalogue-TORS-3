"use client"

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Catalogue from "@/components/catalogueBase";
import Booking from "@/components/booking"

type Room = {
  id: number;
  name: string;
  type: string | null;
};

type BookingItem = {
  id: number;
  name: string;
  quantity: number;
  fixed_room_id: number | null;
};

type SelectedBookingSlot = {
  bookingDate: string;
  roomName: string;
  startTime: string;
  endTime: string;
};

export default function CataloguePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedBookingSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [editBooking, setEditBooking] = useState<any>(null);

  // Read ?editBooking= param and fetch the booking
  useEffect(() => {
    const editId = searchParams.get("editBooking");
    if (!editId) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/booking/${editId}`);
        if (!res.ok) {
          console.error("Failed to fetch booking for editing:", res.status);
          return;
        }
        const data = await res.json();

        // Pre-populate booking items from the fetched booking
        if (data.bookingItems && Array.isArray(data.bookingItems)) {
          setBookingItems(
            data.bookingItems.map((item: any) => ({
              id: item.equipment_id,
              name: item.equipment?.name ?? "",
              quantity: item.quantity_requested,
              fixed_room_id: item.equipment?.fixed_room_id ?? null,
            }))
          );
        }

        setEditBooking(data);
      } catch (error) {
        console.error("Error fetching booking:", error);
      }
    };

    fetchBooking();
  }, [searchParams]);

  // Add item to booking
  const handleAddItem = (item: BookingItem) => {
    setBookingItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
  };

  // Remove item from booking
  const handleRemoveItem = (id: number) => {
    setBookingItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Clear all items
  const handleClearItems = () => setBookingItems([]);

  // If room changes in timetable, remove fixed-room items
  const handleSelectedSlotChange = (slot: SelectedBookingSlot | null) => {
    if (slot && selectedSlot && slot.roomName !== selectedSlot.roomName) {
      setBookingItems((prev) => prev.filter((item) => item.fixed_room_id === null));
    }
    setSelectedSlot(slot);
  };

  // Called when edit is saved or discarded — clears state and strips query param
  const handleEditComplete = () => {
    setEditBooking(null);
    setBookingItems([]);
    router.replace(pathname);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar showLogout={true} links={[
        { href: "/dashboard/student", label: "Home" },
        { href: "/dashboard/student/bookings", label: "Bookings" },
        { href: "/dashboard/student/catalogue", label: "Catalogue", primary: true }
      ]} />

      <div className="flex flex-row flex-1">
        <Catalogue
          selectedRoom={selectedRoom}
          selectedSlot={selectedSlot}
          isBooking={isBooking}
          onAddItem={handleAddItem}
        />

        <Booking
          selectedRoom={selectedRoom}
          onRoomSelect={setSelectedRoom}
          bookingItems={bookingItems}
          onRemoveItem={handleRemoveItem}
          clearItems={handleClearItems}
          selectedSlot={selectedSlot}
          onSelectedSlotChange={handleSelectedSlotChange}
          isBooking={isBooking}
          setIsBooking={setIsBooking}
          editBooking={editBooking}
          onEditComplete={handleEditComplete}
        />
      </div>
    </div>
  )
}