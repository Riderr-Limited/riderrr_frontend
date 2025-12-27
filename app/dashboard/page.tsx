import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { RecentDeliveriesTable } from "@/components/data-table";
import HeadText from "@/components/ui/HeadText";

const page = () => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <HeadText padding="6" text="Dashboard" />
      <SectionCards />
      <div className="px-4 lg:px-6">{/* <ChartAreaInteractive /> */}</div>
      <RecentDeliveriesTable />
    </div>
  );
};

export default page;
