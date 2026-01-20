"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { z } from "zod";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";


/* ---------------------------------------------
 Schema
---------------------------------------------- */
export const schema = z.object({
  id: z.number(),
  pickup: z.string(),
  dropoff: z.string(),
  rider: z.string(),
  pickupTime: z.string(),
});

/* ---------------------------------------------
 Dummy Data
---------------------------------------------- */
const DELIVERY_DATA: z.infer<typeof schema>[] = [
  {
    id: 1,
    pickup: "Lekki Phase 1",
    dropoff: "Yaba",
    rider: "Samuel Ade",
    pickupTime: "12:00pm",
  },
  {
    id: 2,
    pickup: "Ikeja",
    dropoff: "Surulere",
    rider: "John Musa",
    pickupTime: "01:00am",
  },
  {
    id: 3,
    pickup: "Ajah",
    dropoff: "Victoria Island",
    rider: "Ibrahim Lawal",
    pickupTime: "02:00pm",
  },
  {
    id: 4,
    pickup: "Maryland",
    dropoff: "Ikoyi",
    rider: "Ahmed Bello",
    pickupTime: "09:12pm",
  },
];

/* ---------------------------------------------
 Columns
---------------------------------------------- */
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "pickup",
    header: "Pickup Location",
  },
  {
    accessorKey: "dropoff",
    header: "Dropoff Location",
  },
  {
    accessorKey: "rider",
    header: "Rider",
  },
  {
    accessorKey: "pickupTime",
    header: "Pickup Time",
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
        View details
      </button>
    ),
  },
];

/* ---------------------------------------------
 Component
---------------------------------------------- */
export function OngoingDeliveries() {
  const [data] = React.useState(DELIVERY_DATA);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="w-full flex-col gap-6">
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3 text-left">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="h-24 text-center p-3"
                  >
                    No recent deliveries
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2">
          <button
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft />
          </button>
          <button
            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
