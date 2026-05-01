"use client";

import React from "react";
import { Edit, Phone, Mail, MapPin } from "lucide-react";

export default function ProfileOverview() {
  // Rendering the actual info
  const userDetails = {
    firstName: "Hariom",
    lastName: "Sahu",
    email: "hariomsahuu2005@gmail.com",
    phone: "+91 7827074589",
    address: "Mayur Vihar, Block E, Delhi",
    stats: { orders: 5, spent: 9394, wishlistItems: 3 },
  };

  return (
    <div className="space-y-6">
      {/* Personal Info Card */}
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm relative">
        <button className="absolute top-6 right-6 flex items-center gap-2 text-sm font-bold text-[#1A5E54] uppercase hover:opacity-80 transition-opacity">
          <Edit size={16} /> Edit
        </button>
        <h3 className="text-xl font-serif mb-6 text-[#111827]">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              First Name
            </p>
            <p className="font-medium text-gray-900">{userDetails.firstName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Last Name
            </p>
            <p className="font-medium text-gray-900">{userDetails.lastName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Email
            </p>
            <p className="font-medium text-gray-900 flex items-center gap-2">
              <Mail size={16} className="text-gray-400" /> {userDetails.email}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Phone
            </p>
            <p className="font-medium text-gray-900 flex items-center gap-2">
              <Phone size={16} className="text-gray-400" /> {userDetails.phone}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-gray-400 uppercase font-bold mb-1">
              Address
            </p>
            <p className="font-medium text-gray-900 flex items-center gap-2">
              <MapPin size={16} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{userDetails.address}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <h4 className="text-3xl font-serif text-[#1A5E54] mb-2">
            {userDetails.stats.orders}
          </h4>
          <p className="text-xs font-bold text-gray-400 uppercase">
            Total Orders
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <h4 className="text-3xl font-serif text-[#1A5E54] mb-2">
            ₹{userDetails.stats.spent.toLocaleString()}
          </h4>
          <p className="text-xs font-bold text-gray-400 uppercase">
            Total Spent
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <h4 className="text-3xl font-serif text-[#1A5E54] mb-2">
            {userDetails.stats.wishlistItems}
          </h4>
          <p className="text-xs font-bold text-gray-400 uppercase">
            Wishlist Items
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button className="bg-[#1A5E54] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#13433b] transition-colors">
          Create New Account
        </button>
        <button className="bg-transparent text-[#1A5E54] border border-[#1A5E54] px-6 py-3 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
          Sign in to Another Account
        </button>
      </div>
    </div>
  );
}
