import { useOrderMetrics } from '@/hooks/useOrderMetrics';

export default function AvgOrderValue() {
  const timeRange = "7"
  const metrics = useOrderMetrics(timeRange);

  if (!metrics) {
    return <div>Loading...</div>;
  }

  const avgOrderValue = metrics.totalOrders > 0 
    ? metrics.totalValue / metrics.totalOrders 
    : 0;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-card p-4 shadow-sm">
      <h5 className="text-3xl font-bold text-foreground">
        £{avgOrderValue.toFixed(2)}
      </h5>
      <p className="text-sm text-muted-foreground">
        Average Order Value
      </p>
    </div>
  );
}