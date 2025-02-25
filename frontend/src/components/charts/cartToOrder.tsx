import { useCartMetrics, useOrderMetrics } from '@/hooks/useOrderMetrics';

export default function CartToOrder() {
  const timeRange = "7"
  const cartMetrics = useCartMetrics(timeRange);
  const orderMetrics = useOrderMetrics(timeRange);

  if (!cartMetrics || !orderMetrics) {
    return <div>Loading...</div>;
  }

  const conversionRate = cartMetrics.totalCarts > 0
    ? (orderMetrics.totalOrders / cartMetrics.totalCarts) * 100
    : 0;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-card p-4 shadow-sm">
      <h5 className="text-3xl font-bold text-foreground">
        {conversionRate.toFixed(1)}%
      </h5>
      <p className="text-sm text-muted-foreground">
        Cart Conversion Rate
      </p>
    </div>
  );
}