"use client"

import { useState } from "react";
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
};

type SelectedBookingSlot = {
  bookingDate: string;
  roomName: string;
  startTime: string;
  endTime: string;
};

export default function CataloguePage() {

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SelectedBookingSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const handleAddItem = (item: BookingItem) => {
    setBookingItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, item];
    });
  };

  //handler for removing items from the booking
  const handleRemoveItem = (id: number) => {
    setBookingItems((prev) => prev.filter((i) => i.id !== id));
  };

  //when canceling booking, clear selected items
  const handleClearItems = () => setBookingItems([]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar showLogout={true} links={[
        { href: "/dashboard/student", label: "Home" },
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
          onSelectedSlotChange={setSelectedSlot}
          isBooking={isBooking}
          setIsBooking={setIsBooking}
        />
      </div>
    </div>
  );
}