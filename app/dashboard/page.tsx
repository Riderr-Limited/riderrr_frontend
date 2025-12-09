import Card from "@/components/ui/Card";
import Link from "next/link";

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <div>
          <Link href="/dashboard/riders" className="text-sm underline">
            Manage Riders
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold">Total Revenue</h3>
          <div className="text-xl mt-2">₦1,480,000</div>
        </Card>
        <Card>
          <h3 className="font-semibold">Total Deliveries</h3>
          <div className="text-xl mt-2">1,234</div>
        </Card>
        <Card>
          <h3 className="font-semibold">Active Riders</h3>
          <div className="text-xl mt-2">45</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold">Recent Deliveries</h3>
          <div className="text-sm text-slate-600 mt-2">
            List or small table here
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold">Top Riders</h3>
          <div className="text-sm text-slate-600 mt-2">Ranking and metrics</div>
        </Card>
      </div>
    </div>
  );
}
