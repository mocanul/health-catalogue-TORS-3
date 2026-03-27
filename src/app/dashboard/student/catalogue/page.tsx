"use client"

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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

type ExistingBooking = {
  room: Room;
  items: BookingItem[];
  slot: SelectedBookingSlot;
};

function CataloguePageInner() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId")
    ? Number(searchParams.get("bookingId"))
    : null;

  const isEditMode = bookingId !== null;

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedBookingSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // Pre-populate state when editing an existing booking
  useEffect(() => {
    if (!isEditMode) return;

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error("Failed to fetch booking");

        const data: ExistingBooking = await res.json();
        setSelectedRoom(data.room);
        setBookingItems(data.items);
        setSelectedSlot(data.slot);
      } catch (err) {
        console.error("Could not load booking for editing:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, isEditMode]);

  const handleAddItem = (item: BookingItem) => {
    setBookingItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, item];
    });
  };

  const handleRemoveItem = (id: number) => {
    setBookingItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearItems = () => setBookingItems([]);

  const handleSelectedSlotChange = (slot: SelectedBookingSlot | null) => {
    if (slot && selectedSlot && slot.roomName !== selectedSlot.roomName) {
      setBookingItems((prev) => prev.filter((item) => item.fixed_room_id === null));
    }
    setSelectedSlot(slot);
  };

  const navLinks = [
    { href: "/dashboard/student", label: "Home" },
    { href: "/dashboard/student/bookings", label: "Bookings" },
    { href: "/dashboard/student/catalogue", label: "Catalogue", primary: true },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar showLogout={true} links={navLinks} />
        <div className="flex flex-1 items-center justify-center text-gray-500">
          Loading booking...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar showLogout={true} links={navLinks} />

      <div className="flex flex-row flex-1">
        <Catalogue
          selectedRoom={selectedRoom}
          selectedSlot={selectedSlot}
          isBooking={isBooking}
          onAddItem={handleAddItem}
        />

        <Booking
          bookingId={bookingId}
          selectedRoom={selectedRoom}
          onRoomSelect={setSelectedRoom}
          bookingItems={bookingItems}
          onRemoveItem={handleRemoveItem}
          clearItems={handleClearItems}
          selectedSlot={selectedSlot}
          onSelectedSlotChange={handleSelectedSlotChange}
          isBooking={isBooking}
          setIsBooking={setIsBooking}
        />
      </div>
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-500">Loading...</div>}>
      <CataloguePageInner />
    </Suspense>
  );
}