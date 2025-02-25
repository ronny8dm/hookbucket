import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export interface BaseMetrics {
  percentageChange: number;
  timeSeriesData: {
    dates: string[];
    [key: string]: number[] | string[];
  };
}


export interface CartMetrics extends BaseMetrics {
  totalCarts: number;
  timeSeriesData: {
    dates: string[];
    counts: number[];
  };
}


export interface CartValueMetrics extends BaseMetrics {
  totalValue: number;
  timeSeriesData: {
    dates: string[];
    values: number[];
  };
}

export interface OrderMetrics extends BaseMetrics {
  totalOrders: number;
  totalValue: number;
  timeSeriesData: {
    dates: string[];
    counts: number[];
    values: number[];
  };
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  totalInventory: number
  featuredImage: {
    url: string
  }
  productType: string
  vendor: string
  collections: {
    edges: Array<{
      node: {
        title: string
      }
    }>
  }
  publishedAt: string | null
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const convertToCSV = <T extends BaseMetrics>(
  data: T, 
  headers: string[], 
  valueKey: keyof T['timeSeriesData']
) => {
  const rows = data.timeSeriesData.dates.map((date, index) => {
    return [date, data.timeSeriesData[valueKey][index]];
  });
  
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

export const downloadCSV = <T extends BaseMetrics>(
  data: T, 
  filename: string,
  headers: string[],
  valueKey: keyof T['timeSeriesData']
) => {
  const csv = convertToCSV(data, headers, valueKey);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Specific download functions
export const downloadCartMetricsCSV = (data: CartMetrics) => {
  downloadCSV(
    data,
    'cart-metrics-report',
    ['Date', 'New Carts Created'],
    'counts'
  );
};

export const downloadCartValueCSV = (data: CartValueMetrics) => {
  downloadCSV(
    data,
    'cart-value-report',
    ['Date', 'Cart Value'],
    'values'
  );
};