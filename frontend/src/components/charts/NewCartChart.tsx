// src/components/dashboard/components/CartMetricsChart.tsx
import  {  useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn, downloadCartMetricsCSV } from "@/lib/utils";
import { useCartMetrics } from "@/hooks/useOrderMetrics";

export function NewCartChart() {
  const [timeRange, setTimeRange] = useState("7");
  const metrics = useCartMetrics
  
  (timeRange);

  const chartOptions: ApexOptions = {
    chart: {
      height: 350,
      type: "area",
      fontFamily: "Inter, sans-serif",
      dropShadow: {
        enabled: false,
      },
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      enabled: true,
      y:{
        formatter: (value) => `${value} active cart${value !== 1 ? 's' : ''}`
      },
      x: {
        show: true,
      formatter: (value) => new Date(value).toLocaleDateString()
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
        shade: "#1C64F2",
        gradientToColors: ["#1C64F2"],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 3,
    curve: 'smooth'
    },
    grid: {
      show: false,
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: 0,
      },
    },
    series: [
      {
        name: "New Carts",
        data: metrics?.timeSeriesData.counts || [],
        color: "#1A56DB",
      },
    ],
    xaxis: {
      categories: metrics?.timeSeriesData.dates || [],
      labels: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: false,
    },
  };

  

  if (!metrics) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col rounded-lg  bg-card p-2 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h5 className="text-2xl font-bold text-foreground sm:text-3xl">
            {metrics.totalCarts}
          </h5>
          <p className="text-sm text-muted-foreground sm:text-base">
            New Carts Created
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-1 rounded-md px-2 py-1 text-sm font-semibold",
            metrics.percentageChange >= 0
              ? "text-green-500 dark:text-green-400"
              : "text-red-500 dark:text-red-400"
          )}
        >
          {metrics.percentageChange.toFixed(1)}%
          <svg
            className="h-3 w-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={
                metrics.percentageChange >= 0
                  ? "M5 13V1m0 0L1 5m4-4 4 4"
                  : "M5 1v12m0 0l4-4m-4 4L1 9"
              }
            />
          </svg>
        </div>
      </div>

      <div className="relative flex-1 py-4">
        <ReactApexChart
          options={{
            ...chartOptions,
            chart: {
              ...chartOptions.chart,
              height: "100%",
              width: "100%",
              toolbar: { show: false },
              zoom: { enabled: false },
            },
          }}
          series={chartOptions.series}
          type="area"
          height="100%"
          width="100%"
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 text-sm">
              Last {timeRange} days
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => setTimeRange("1")}>
              Yesterday
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTimeRange("7")}>
              Last 7 days
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTimeRange("30")}>
              Last 30 days
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setTimeRange("90")}>
              Last 90 days
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-semibold uppercase"
          onClick={() => metrics && downloadCartMetricsCSV(metrics)}
        >
          <span>Download Report</span>
          <svg
            className="ml-2 h-2.5 w-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
        </Button>
      </div>
    </div>
  );
}
