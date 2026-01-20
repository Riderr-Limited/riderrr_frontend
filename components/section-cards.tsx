import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";



export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
          <div className="text-2xl font-semibold">
            N1,250.00
          </div>
        </div>
      </div>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Balance</div>
          <div className="text-2xl font-semibold">
            N1,250.00
          </div>
        </div>
      </div>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Total Deliveries</div>
          <div className="text-2xl font-semibold">
            1,234
          </div>
        </div>
      </div>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-1">Active Riders</div>
          <div className="text-2xl font-semibold">
            45,678
          </div>
        </div>
      </div>
    </div>
  );
}
