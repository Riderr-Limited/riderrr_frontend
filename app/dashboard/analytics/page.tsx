import Card from "@/components/ui/Card";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold">Revenue by day (Last 7 days)</h3>
          <div className="mt-4 text-sm text-slate-600">[Chart placeholder]</div>
        </Card>

        <Card>
          <h3 className="font-semibold">Revenue by hour (Today)</h3>
          <div className="mt-4 text-sm text-slate-600">[Chart placeholder]</div>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold">Average delivery value</h3>
          <div className="mt-2">₦1,200</div>
        </Card>
        <Card>
          <h3 className="font-semibold">Commission to platform</h3>
          <div className="mt-2">15%</div>
        </Card>
        <Card>
          <h3 className="font-semibold">Completion rate</h3>
          <div className="mt-2">98%</div>
        </Card>
      </div>
    </div>
  );
}
