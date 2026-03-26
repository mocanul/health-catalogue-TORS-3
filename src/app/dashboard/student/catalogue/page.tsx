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
  fixed_room_id: number | null;
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

  //add item to booking
  const handleAddItem = (item: BookingItem) => {
    setBookingItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
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

  //if room has been changed in timetable, remove fixed_room items in database
  const handleSelectedSlotChange = (slot: SelectedBookingSlot | null) => {
    if (slot && selectedSlot && slot.roomName !== selectedSlot.roomName) {
      setBookingItems((prev) => prev.filter((item) => item.fixed_room_id === null));
    }
    setSelectedSlot(slot);
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
        />
      </div>
    </div>
  )
}