import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOrderMetrics } from "@/hooks/useOrderMetrics";


export default function TotalOrderPaid() {
  const [timeRange, setTimeRange] = useState("7");
  const metrics = useOrderMetrics(timeRange);

  const chartOptions: ApexOptions = {
    chart: {
      height: 350,
      type: "line",
      fontFamily: "Inter, sans-serif",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    tooltip: {
      enabled: true,
      y: [
        {
          formatter: (value) => `${value} orders`,
        },
        {
          formatter: (value) => `$${value.toFixed(2)}`,
        },
      ],
    },
    stroke: {
      width: [3, 3],
      curve: 'smooth',
    },
    grid: {
      show: true,
      borderColor: '#f1f1f1',
      strokeDashArray: 4,
      padding: {
        left: 2,
        right: 2,
        top: 0,
      },
    },
    series: [
      {
        name: "Orders",
        type: "line",
        data: metrics?.timeSeriesData.counts || [],
      },
      {
        name: "Revenue",
        type: "line",
        data: metrics?.timeSeriesData.values || [],
      },
    ],
    colors: ['#1A56DB', '#16A34A'],
    xaxis: {
      categories: metrics?.timeSeriesData.dates || [],
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
        },
      },
    },
    yaxis: [
      {
        title: {
          text: "Number of Orders",
        },
        labels: {
          style: {
            colors: '#64748b',
          },
        },
      },
      {
        opposite: true,
        title: {
          text: "Revenue",
        },
        labels: {
          formatter: (value) => `$${value.toFixed(0)}`,
          style: {
            colors: '#64748b',
          },
        },
      },
    ],
    legend: {
      show: true,
      position: 'top',
    },
  };


  if (!metrics) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full w-full flex-col rounded-lg bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h5 className="text-2xl font-bold text-foreground sm:text-3xl">
            {metrics.totalOrders}
          </h5>
          <p className="text-sm text-muted-foreground sm:text-base">
            Total Orders
          </p>
        </div>

        <div className="space-y-1">
          <h5 className="text-2xl font-bold text-foreground sm:text-3xl">
            £{metrics.totalValue.toFixed(2)}
          </h5>
          <p className="text-sm text-muted-foreground sm:text-base">
            Total Revenue
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
          options={chartOptions}
          series={chartOptions.series}
          type="line"
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
      </div>
    </div>
  );
}