'use client';

import React from "react";
import { Input } from "@/components/ui/input";
import { LinkIcon, TrashIcon } from "lucide-react";

export function ProfileForm() {
  return (
    <div className="space-y-6">
      <div className="relative">
        <img
          src="/Cover.png"
          alt="Profile Banner"
          className="w-full h-48 object-cover rounded-lg"
        />

        <div
          className="absolute bottom-4 left-4 flex space-x-2"
        >
          <button
            className="p-2 bg-white rounded-full"
          >
            <LinkIcon
              className="h-5 w-5 text-gray-600"
            />
          </button>
          <button
            className="p-2 bg-white rounded-full"
          >
            <TrashIcon
              className="h-5 w-5 text-gray-600"
            />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-1 "
          >
            First Name
          </label>
          <Input
            placeholder="Barbara"
            className="w-full  bg-oohpoint-grey-100"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1 "
          >
            Last Name
          </label>
          <Input
            placeholder="Anderson"
            className="w-full  bg-oohpoint-grey-100"
          />
        </div>
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1 "
        >
          Email
        </label>
        <Input
          placeholder="banderson@gmail.com"
          className="w-full  bg-oohpoint-grey-100"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1 "
        >
          Phone
        </label>
        <Input
          placeholder="310-685-3335"
          className="w-full  bg-oohpoint-grey-100"
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
        >
          Address
        </label>
        <Input
          placeholder="Street Address"
          className="w-full mb-  bg-oohpoint-grey-100"
        />
        <div className="grid grid-cols-3 gap-2 mt-5">
          <Input
            placeholder="City"
            className="w-full  bg-oohpoint-grey-100"
          />
          <Input
            placeholder="State / Province"
            className="w-full  bg-oohpoint-grey-100"
          />
          <Input
            placeholder="Zip Code"
            className="w-full  bg-oohpoint-grey-100"
          />
        </div>
      </div>
      <div>
        <label
          className="block text-sm font-medium mb-1"
        >
          Pet Information
        </label>
        <Input
          placeholder="pet 1 type, type, breed, Age"
          className="w-full  bg-oohpoint-grey-100"
        />
      </div>
    </div>
  );
}
