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

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

/* ---------------------------------------------
 Schema
---------------------------------------------- */
export const schema = z.object({
  id: z.number(),
  pickup: z.string(),
  dropoff: z.string(),
  rider: z.string(),
  status: z.enum(["Delivered", "In Transit", "Pending"]),
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
    status: "Delivered",
  },
  {
    id: 2,
    pickup: "Ikeja",
    dropoff: "Surulere",
    rider: "John Musa",
    status: "In Transit",
  },
  {
    id: 3,
    pickup: "Ajah",
    dropoff: "Victoria Island",
    rider: "Ibrahim Lawal",
    status: "Pending",
  },
  {
    id: 4,
    pickup: "Maryland",
    dropoff: "Ikoyi",
    rider: "Ahmed Bello",
    status: "Delivered",
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="flex w-fit items-center gap-1 px-2 text-muted-foreground"
      >
        {row.original.status === "Delivered" ? (
          <IconCircleCheckFilled className="size-4 fill-green-500" />
        ) : (
          <IconLoader className="size-4" />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <Button size="sm" variant="outline">
        View details
      </Button>
    ),
  },
];

/* ---------------------------------------------
 Component
---------------------------------------------- */
export function RecentDeliveriesTable() {
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
    <Tabs defaultValue="outline" className="w-full flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6">
        <h2 className="text-sm font-semibold">Recent Deliveries</h2>
        <Link
          href="/dashboard/deliveries"
          className="p-2 border-none cursor-pointer"
        >
          View All
        </Link>
      </div>

      {/* Table */}
      <TabsContent
        value="outline"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No recent deliveries
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <IconChevronRight />
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
