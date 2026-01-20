import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";


export default function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <SiteHeader />
        <div className="flex-1">
          <div className="flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
