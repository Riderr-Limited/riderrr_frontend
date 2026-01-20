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
import {
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheckFilled,
  IconLoader,
} from "@tabler/icons-react";



type ModalProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

/* ---------------------------------------------
 Schema
---------------------------------------------- */
export const schema = z.object({
  id: z.number(),
  name: z.string(),
  number: z.string(),
  rating: z.string(),
  status: z.enum(["online", "offline"]),
});

/* ---------------------------------------------
 Dummy Data
---------------------------------------------- */
const DELIVERY_DATA: z.infer<typeof schema>[] = [
  {
    id: 1,
    name: "Lekki Phase 1",
    number: "043938943232",
    rating: "3.00",
    status: "online",
  },
  {
    id: 2,
    name: "Ikeja",
    number: "2341312131",
    rating: "0.00",
    status: "offline",
  },
  {
    id: 3,
    name: "43233431223",
    number: "Victoria Island",
    rating: "5.00",
    status: "offline",
  },
  {
    id: 4,
    name: "Maryland",
    number: "4324234234",
    rating: "4.00",
    status: "online",
  },
];

/* ---------------------------------------------
 Columns
---------------------------------------------- */
const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "number",
    header: "Phone Number",
  },
  {
    accessorKey: "rating",
    header: "Rating",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="flex w-fit items-center gap-1 px-2 text-muted-foreground border rounded">
        {row.original.status === "online" ? (
          <IconCircleCheckFilled className="size-4 fill-green-500" />
        ) : (
          <IconLoader className="size-4" />
        )}
        {row.original.status}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">
        View Profile
      </button>
    ),
  },
];

/* ---------------------------------------------
 Component
---------------------------------------------- */
export function RiderList({ open, setOpen }: ModalProps) {
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h2 className="text-sm font-semibold">Your Riders</h2>
        <button
          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
          onClick={() => setOpen(true)}
        >
          Add New Rider
        </button>
      </div>

      {/* Table */}
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
                    You have not registered any rider
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
