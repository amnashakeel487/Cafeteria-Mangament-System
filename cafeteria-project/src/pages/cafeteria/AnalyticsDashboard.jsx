import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import PageSEO from '../../seo/PageSEO';
import { PAGE_SEO } from '../../seo/siteConfig';
import StatCard from '../../components/analytics/StatCard';
import BestSellingChart from '../../components/analytics/BestSellingChart';
import PeakHoursChart from '../../components/analytics/PeakHoursChart';
import CategoryBreakdownChart from '../../components/analytics/CategoryBreakdownChart';
import WeeklyComparisonChart from '../../components/analytics/WeeklyComparisonChart';
import RevenueTrendChart from '../../components/analytics/RevenueTrendChart';
import ExportButton from '../../components/analytics/ExportButton';
import {
  exportToCSV,
  prepareOrdersCSV,
  prepareItemsCSV,
  formatSummaryForPdf,
} from '../../utils/exportUtils';
import { formatPrice } from '../../utils/currency';

const PERIOD_BUTTONS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'custom', label: 'Custom' },
];

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-surface-container-high rounded-2xl border border-outline-variant/10 p-6 shadow-lg ${className}`}>
      <h3 className="text-lg font-bold text-on-surface mb-4 font-['Manrope']">{title}</h3>
      {children}
    </div>
  );
}

function readCafeteriaFromStorage() {
  try {
    const raw = localStorage.getItem('cafeteriaData');
    return raw ? JSON.parse(raw) : {};
  } catch {
    localStorage.removeItem('cafeteriaData');
    return {};
  }
}

export default function AnalyticsDashboard() {
  const cafeteria = readCafeteriaFromStorage();
  const token = localStorage.getItem('cafeteriaToken');
  const axiosConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const [period, setPeriod] = useState('week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [trendPeriod, setTrendPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState('');

  const [overview, setOverview] = useState(null);
  const [bestSelling, setBestSelling] = useState(null);
  const [peakHours, setPeakHours] = useState(null);
  const [byCategory, setByCategory] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [trend, setTrend] = useState(null);

  const queryParams = useMemo(() => {
    const p = { period };
    if (period === 'custom' && customStart && customEnd) {
      p.startDate = customStart;
      p.endDate = customEnd;
    }
    return p;
  }, [period, customStart, customEnd]);

  const dateRangeLabel = useMemo(() => {
    if (period === 'custom' && customStart && customEnd) {
      return { start: customStart, end: customEnd };
    }
    if (overview?.period) {
      return {
        start: overview.period.start?.slice(0, 10) || '',
        end: overview.period.end?.slice(0, 10) || '',
      };
    }
    return { start: '', end: '' };
  }, [period, customStart, customEnd, overview]);

  const fetchAll = useCallback(async () => {
    if (period === 'custom' && (!customStart || !customEnd)) return;

    setLoading(true);
    setError('');
    try {
      const [ov, bs, ph, cat, wk, tr] = await Promise.all([
        axios.get('/api/cafeteria/analytics/overview', { ...axiosConfig, params: queryParams }),
        axios.get('/api/cafeteria/analytics/best-selling', { ...axiosConfig, params: { ...queryParams, limit: 10 } }),
        axios.get('/api/cafeteria/analytics/peak-hours', { ...axiosConfig, params: queryParams }),
        axios.get('/api/cafeteria/analytics/by-category', { ...axiosConfig, params: queryParams }),
        axios.get('/api/cafeteria/analytics/weekly-comparison', axiosConfig),
        axios.get('/api/cafeteria/analytics/revenue-trend', {
          ...axiosConfig,
          params: { period: trendPeriod },
        }),
      ]);
      setOverview(ov.data);
      setBestSelling(bs.data);
      setPeakHours(ph.data);
      setByCategory(cat.data);
      setWeekly(wk.data);
      setTrend(tr.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [axiosConfig, queryParams, period, customStart, customEnd, trendPeriod]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const exportParams = () => ({
    ...queryParams,
    period: period === 'custom' ? 'custom' : queryParams.period,
    startDate: dateRangeLabel.start,
    endDate: dateRangeLabel.end,
  });

  const handleExportOrders = async () => {
    setExporting(true);
    try {
      const res = await axios.get('/api/cafeteria/analytics/export', {
        ...axiosConfig,
        params: { ...exportParams(), type: 'orders' },
      });
      exportToCSV(prepareOrdersCSV(res.data.orders || []), 'orders');
      showToastMsg('CSV downloaded successfully');
    } catch {
      showToastMsg('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportItems = async () => {
    setExporting(true);
    try {
      const res = await axios.get('/api/cafeteria/analytics/export', {
        ...axiosConfig,
        params: { ...exportParams(), type: 'items' },
      });
      exportToCSV(prepareItemsCSV(res.data.items || bestSelling?.items || []), 'items_report');
      showToastMsg('Items report downloaded');
    } catch {
      showToastMsg('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleExportCSV = handleExportOrders;

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const [ordersRes, itemsRes] = await Promise.all([
        axios.get('/api/cafeteria/analytics/export', {
          ...axiosConfig,
          params: { ...exportParams(), type: 'orders' },
        }),
        axios.get('/api/cafeteria/analytics/best-selling', {
          ...axiosConfig,
          params: { ...queryParams, limit: 15 },
        }),
      ]);

      const orderRows = prepareOrdersCSV(ordersRes.data.orders || []);
      const itemRows = (itemsRes.data.items || []).map((item) => ({
        name: item.name,
        category: item.category,
        qty: item.totalQuantity,
        revenue: formatPrice(item.totalRevenue),
        pct: `${item.percentageOfTotal}%`,
      }));

      const { exportToPDF } = await import('../../utils/exportUtilsPdf');
      exportToPDF({
        title: 'Analytics Report',
        cafeteriaName: cafeteria.name || 'Cafeteria',
        dateRange: dateRangeLabel,
        summaryStats: overview ? formatSummaryForPdf(overview) : [],
        tableData: itemRows.length ? itemRows : orderRows,
        columns: itemRows.length
          ? [
              { header: 'Item', key: 'name' },
              { header: 'Category', key: 'category' },
              { header: 'Qty', key: 'qty' },
              { header: 'Revenue', key: 'revenue' },
              { header: '%', key: 'pct' },
            ]
          : [
              { header: 'Order ID', key: 'Order ID' },
              { header: 'Date', key: 'Date' },
              { header: 'Student', key: 'Student' },
              { header: 'Total', key: 'Total (Rs)' },
              { header: 'Status', key: 'Status' },
            ],
        filename: 'analytics_report',
      });
      showToastMsg('PDF report downloaded');
    } catch {
      showToastMsg('PDF export failed');
    } finally {
      setExporting(false);
    }
  };

  const completionRate =
    overview && overview.totalOrders > 0
      ? Math.round((overview.completedOrders / overview.totalOrders) * 100)
      : 0;

  const empty = !loading && overview?.totalOrders === 0;

  return (
    <>
      <PageSEO {...PAGE_SEO.cafeDashboard} title="Analytics | COMSTAS Cafe" />
      <section className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pt-6 md:pt-10">
        {toast && (
          <div className="fixed bottom-8 right-8 z-50 px-4 py-3 rounded-xl bg-[#28A745] text-white font-bold text-sm shadow-xl">
            {toast}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-on-surface font-['Manrope']">
              Analytics &amp; Insights
            </h1>
            <p className="text-on-surface-variant text-sm mt-1">Track your performance and grow</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {PERIOD_BUTTONS.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setPeriod(b.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  period === b.id ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {b.label}
              </button>
            ))}
            <button
              type="button"
              onClick={fetchAll}
              className="p-2 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-primary"
              title="Refresh"
            >
              <span className="material-symbols-outlined">refresh</span>
            </button>
            <ExportButton
              loading={exporting}
              disabled={empty}
              onExportCSV={handleExportCSV}
              onExportPDF={handleExportPDF}
              onExportOrders={handleExportOrders}
              onExportItems={handleExportItems}
            />
          </div>
        </div>

        {period === 'custom' && (
          <div className="flex flex-wrap gap-3 items-end">
            <label className="text-xs text-on-surface-variant">
              From
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="block mt-1 rounded-lg bg-surface-container-lowest px-3 py-2 text-sm text-on-surface"
              />
            </label>
            <label className="text-xs text-on-surface-variant">
              To
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="block mt-1 rounded-lg bg-surface-container-lowest px-3 py-2 text-sm text-on-surface"
              />
            </label>
            <button
              type="button"
              onClick={fetchAll}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-bold"
            >
              Apply
            </button>
          </div>
        )}

        {lastUpdated && (
          <p className="text-[10px] text-on-surface-variant">
            Last updated {format(lastUpdated, 'HH:mm:ss')}
          </p>
        )}

        {error && (
          <div className="p-6 rounded-xl bg-error/10 border border-error/30 text-center">
            <p className="text-error font-bold mb-3">{error}</p>
            <button type="button" onClick={fetchAll} className="text-sm font-bold text-primary underline">
              Try again
            </button>
          </div>
        )}

        {empty && !error && (
          <div className="py-16 text-center rounded-2xl border border-dashed border-outline-variant/30">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">analytics</span>
            <p className="text-on-surface font-bold mt-4">No orders in this period</p>
            <p className="text-sm text-on-surface-variant mt-1">Try a wider date range</p>
          </div>
        )}

        {!error && !empty && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                title="Total Revenue"
                value={overview?.totalRevenue}
                isCurrency
                icon="payments"
                color="cyan"
                loading={loading}
                trend={`${overview?.revenueGrowth >= 0 ? '+' : ''}${overview?.revenueGrowth ?? 0}% vs previous`}
                trendValue={overview?.revenueGrowth}
              />
              <StatCard
                title="Total Orders"
                value={overview?.totalOrders}
                icon="receipt_long"
                color="blue"
                loading={loading}
                trend={`${overview?.orderGrowth >= 0 ? '+' : ''}${overview?.orderGrowth ?? 0}% vs previous`}
                trendValue={overview?.orderGrowth}
              />
              <StatCard
                title="Avg Order Value"
                value={overview?.averageOrderValue}
                isCurrency
                icon="trending_up"
                color="purple"
                loading={loading}
              />
              <StatCard
                title="Items Sold"
                value={overview?.totalItemsSold}
                icon="shopping_bag"
                color="amber"
                loading={loading}
              />
            </div>

            {!loading && overview && (
              <div className="flex flex-wrap gap-3">
                {overview.topSellingItem && (
                  <span className="px-3 py-1.5 rounded-full bg-surface-container-high text-xs font-bold text-on-surface border border-outline-variant/10">
                    🏆 Best Item: {overview.topSellingItem.name} ({overview.topSellingItem.count} sold)
                  </span>
                )}
                {overview.busiestHour && (
                  <span className="px-3 py-1.5 rounded-full bg-surface-container-high text-xs font-bold text-on-surface border border-outline-variant/10">
                    ⏰ Peak Hour: {overview.busiestHour.hour} ({overview.busiestHour.orderCount} orders)
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-full bg-surface-container-high text-xs font-bold text-on-surface border border-outline-variant/10">
                  📦 Completion Rate: {completionRate}%
                </span>
              </div>
            )}

            <ChartCard title="Revenue Trend">
              <RevenueTrendChart
                data={trend}
                loading={loading}
                period={trendPeriod}
                onPeriodChange={(p) => {
                  setTrendPeriod(p);
                  axios
                    .get('/api/cafeteria/analytics/revenue-trend', {
                      ...axiosConfig,
                      params: { period: p },
                    })
                    .then((r) => setTrend(r.data));
                }}
              />
            </ChartCard>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <ChartCard title="Best Selling Items" className="lg:col-span-3">
                <BestSellingChart data={bestSelling?.items} loading={loading} />
              </ChartCard>
              <ChartCard title="Revenue by Category" className="lg:col-span-2">
                <CategoryBreakdownChart data={byCategory} loading={loading} />
              </ChartCard>
            </div>

            <ChartCard title="This Week vs Last Week">
              <WeeklyComparisonChart data={weekly} loading={loading} />
            </ChartCard>

            <ChartCard title="Peak Hours Analysis">
              <PeakHoursChart data={peakHours} loading={loading} />
              {peakHours?.peakHour && (
                <p className="text-sm text-on-surface-variant mt-4 border-t border-outline-variant/10 pt-4">
                  Your busiest time is <strong className="text-[#06d6c7]">{peakHours.peakHour.label}</strong>.
                  Consider having extra staff ready.
                </p>
              )}
            </ChartCard>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10">
                <p className="text-xs font-bold text-tertiary uppercase mb-1">Top Performer</p>
                <p className="text-sm text-on-surface">
                  {overview?.topSellingItem
                    ? `${overview.topSellingItem.name} is your best seller with ${overview.topSellingItem.count} sold`
                    : '—'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10">
                <p className="text-xs font-bold text-primary uppercase mb-1">Revenue Alert</p>
                <p className="text-sm text-on-surface">
                  {weekly?.comparison
                    ? `Revenue is ${weekly.comparison.revenueGrowth >= 0 ? 'up' : 'down'} ${Math.abs(weekly.comparison.revenueGrowth)}% vs last week`
                    : '—'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/10">
                <p className="text-xs font-bold text-amber-400 uppercase mb-1">Quick Tip</p>
                <p className="text-sm text-on-surface">
                  {peakHours?.quietestHour?.orderCount === 0
                    ? 'Use quiet hours to prep ingredients for peak times.'
                    : `Quietest hour: ${peakHours?.quietestHour?.label || '—'}`}
                </p>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
