import { AppSidebar } from "./components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NewCartChart } from "../charts/NewCartChart";
import { TotalCartValue } from "../charts/TotalCartValue";
import TotalOrderPaid from "../charts/TotalOrderPaid";
import AvgOrderValue from "../charts/AvgOrderValue";
import CartToOrder from "../charts/cartToOrder";

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block ">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <div className="border rounded-xl bg-muted/50">
              <NewCartChart />
            </div>
            <div className="border rounded-xl bg-muted/50" >
            <TotalCartValue />
            </div>
          </div>
          <div className="flex-1 rounded-xl border bg-card p-4 shadow-sm md:min-h-[300px]" >
          <TotalOrderPaid />
          </div>
          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <div className="border rounded-xl bg-muted/50">
              <AvgOrderValue />
            </div>
            <div className="border rounded-xl bg-muted/50" >
            <CartToOrder />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
