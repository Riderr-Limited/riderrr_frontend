// components/riders/RiderList.tsx
type Rider = {
  id: string | number;
  name: string;
  online?: boolean;
  location?: string | null;
  activeDeliveries?: number;
  rating?: number | null;
};

export default function RiderList({ riders = [] }: { riders: Rider[] }) {
  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="p-3 text-left">Rider</th>
            <th>Status</th>
            <th>Location</th>
            <th>Active</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {riders.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-slate-500">
                No riders yet.
              </td>
            </tr>
          )}
          {riders.map((r) => (
            <tr key={r.id} className="border-b">
              <td className="p-3">{r.name}</td>
              <td>{r.online ? "Online" : "Offline"}</td>
              <td>{r.location || "-"}</td>
              <td>{r.activeDeliveries}</td>
              <td>{r.rating ?? "-"}</td>
              <td>
                <button className="text-sm underline">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
