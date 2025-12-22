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
      <Button size="sm" variant="outline">
        View details
      </Button>
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
    <Tabs defaultValue="outline" className="w-full flex-col gap-6">
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
