import Papa from 'papaparse';
import { format } from 'date-fns';
import { formatPrice } from './currency';

export const exportToCSV = (data, filename) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const prepareOrdersCSV = (orders) =>
  orders.map((order) => ({
    'Order ID': order.id,
    Date: format(new Date(order.created_at), 'dd/MM/yyyy HH:mm'),
    Student: order.student_name || '-',
    Items: order.item_count,
    'Total (Rs)': order.total_amount,
    'Payment Method': order.payment_method,
    Status: order.status,
  }));

export const prepareItemsCSV = (items) =>
  items.map((item) => ({
    'Item Name': item.name,
    Category: item.category,
    'Qty Sold': item.totalQuantity,
    'Revenue (Rs)': item.totalRevenue,
    Orders: item.orderCount,
    'Avg Rating': item.avgRating ?? 'N/A',
    '% of Total': `${item.percentageOfTotal}%`,
  }));

export const formatSummaryForPdf = (overview) => [
  { label: 'Total Revenue', value: formatPrice(overview.totalRevenue) },
  { label: 'Total Orders', value: String(overview.totalOrders) },
  { label: 'Avg Order', value: formatPrice(overview.averageOrderValue) },
  { label: 'Items Sold', value: String(overview.totalItemsSold) },
];
