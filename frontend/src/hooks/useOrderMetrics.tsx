import { useState, useEffect } from 'react';
import { OrderMetrics, CartMetrics, CartValueMetrics} from '@/lib/utils';

export function useFetchData(timeRange: string) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/webhook`);
        if (response.status === 401) {
          window.location.href = `${import.meta.env.VITE_API_URL}/auth/signin`;
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        setData(await response.json());
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchData();
  }, [timeRange]);

  return data;
}

export function useOrderMetrics(timeRange: string): OrderMetrics | null {
  const data = useFetchData(timeRange);

  if (!data) return null;

  const paidOrders = data.paidOrders.orders || [];
  const groupedByDate = paidOrders.reduce((acc: any, order: any) => {
    const date = new Date(order.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { count: 0, value: 0 };
    }
    acc[date].count += 1;
    acc[date].value += order.total_value || 0;
    return acc;
  }, {});

  const dates = getDates(timeRange);
  const counts = dates.map((date) => groupedByDate[date]?.count || 0);
  const values = dates.map((date) => groupedByDate[date]?.value || 0);
  const percentageChange = calculatePercentageChange(counts);

  return {
    totalOrders: paidOrders.length,
    totalValue: data.paidOrders.totalValue,
    percentageChange,
    timeSeriesData: { dates, counts, values },
  };
}

export function useCartMetrics(timeRange: string): CartMetrics | null {
  const data = useFetchData(timeRange);

  if (!data) return null;

  const paidCartTokens = new Set(data.paidOrders?.cartTokens || []);
  const allCartEvents = data.eventsByType.cart_creation || [];
  const activeCartEvents = allCartEvents.filter(
    (event: any) => !paidCartTokens.has(event.id)
  );

  const groupedByDate = activeCartEvents.reduce((acc: any, event: any) => {
    const date = new Date(event.timestamp).toLocaleDateString();
    if (!acc[date]) acc[date] = { count: 0 };
    acc[date].count += 1;
    return acc;
  }, {});

  const dates = getDates(timeRange);
  const counts = dates.map((date) => groupedByDate[date]?.count || 0);
  const percentageChange = calculatePercentageChange(counts);

  return {
    totalCarts: activeCartEvents.length,
    percentageChange,
    timeSeriesData: { dates, counts },
  };
}

export function useCartValueMetrics(timeRange: string): CartValueMetrics | null {
  const data = useFetchData(timeRange);

  if (!data) return null;

  
  const latestCartValues = new Map();
  
  data.raw
    .filter((event: any) => {
      const cartToken = event.token || event.id;
      return !data.paidOrders.cartTokens.includes(cartToken);
    })
    .forEach((event: any) => {
      const cartToken = event.token || event.id;
      const timestamp = new Date(event.updated_at || event.created_at || event.timestamp).getTime();
      
      const current = latestCartValues.get(cartToken);
      if (!current || timestamp >= current.timestamp) {
        latestCartValues.set(cartToken, {
          timestamp,
          value: event.totalValue || 0,
          date: new Date(event.updated_at || event.created_at || event.timestamp).toLocaleDateString()
        });
      }
    });

 
  const totalValue = Array.from(latestCartValues.values())
    .reduce((sum, { value }) => sum + value, 0);

  
  const groupedByDate = new Map();
  latestCartValues.forEach(({ date, value }) => {
    groupedByDate.set(date, (groupedByDate.get(date) || 0) + value);
  });

  const dates = getDates(timeRange);
  const values = dates.map(date => groupedByDate.get(date) || 0);
  const percentageChange = calculatePercentageChange(values);


  return {
    totalValue,
    percentageChange,
    timeSeriesData: { dates, values },
  };
}



function getDates(timeRange: string): string[] {
  const today = new Date();
  const dates = [];
  for (let i = parseInt(timeRange) - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date.toLocaleDateString());
  }
  return dates;
}

function calculatePercentageChange(values: number[]): number {
  const current = values[values.length - 1] || 0;
  const previous = values[values.length - 2] || 0;
  return previous === 0 
    ? current > 0 ? 100 : 0 
    : ((current - previous) / previous) * 100;
}