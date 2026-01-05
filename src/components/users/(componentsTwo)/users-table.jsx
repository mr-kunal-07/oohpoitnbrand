'use client';

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/users/uiTwo/table";
import { Button } from "@/components/users/uiTwo/button";
import { Badge } from "@/components/users/uiTwo/badge";

const users = [
  {
    id: 1,
    userName: "YSGBGFCNDB",
    emailId: "hgdjfhv@gmail.com",
    phoneNumber: "+91 675645346",
    joinedDate: "11-09-2024",
    lastActivity: "11-09-2024",
    totalOrders: 88,
    status: "Active",
  },
  // ... Add more user objects here
];

export function UsersTable() {
  return (
    <div className="rounded-md border">
      <Table className="bg-baw-baw-g4">
        <TableHeader>
          <TableRow>
            <TableHead>User Name</TableHead>
            <TableHead>Email ID</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead>Last Activity</TableHead>
            <TableHead>
              Total Orders/Services
            </TableHead>
            <TableHead>User Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.userName}
              </TableCell>
              <TableCell>{user.emailId}</TableCell>
              <TableCell>
                {user.phoneNumber}
              </TableCell>
              <TableCell>
                {user.joinedDate}
              </TableCell>
              <TableCell>
                {user.lastActivity}
              </TableCell>
              <TableCell>
                {user.totalOrders}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-200"
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Details
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Block
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
