import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  RefreshCw,
  Calendar,
  BarChart3,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reportsApi } from "@/services/reportsApi";
import { SalesOverviewTab } from "@/components/reports/SalesOverviewTab";
import { TopProductsTab } from "@/components/reports/TopProductsTab";
import { TopCustomersTab } from "@/components/reports/TopCustomersTab";
import { CategoryPerformanceTab } from "@/components/reports/CategoryPerformanceTab";
import { ProductSalesTab } from "@/components/reports/ProductSalesTab";
import { CustomerPurchasesTab } from "@/components/reports/CustomerPurchasesTab";

const getMonthOptions = () => {
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];
  return months;
};

const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= currentYear - 5; year--) {
    years.push(year);
  }
  return years;
};

export const ReportsContent = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Default to December 2025 (where data exists) instead of current month
  const [selectedMonth, setSelectedMonth] = useState(12);
  const [selectedYear, setSelectedYear] = useState(2025);

  // Fetch all report data
  const { data: salesOverview = [], isLoading: loadingOverview, refetch: refetchOverview } = useQuery({
    queryKey: ['monthly-sales-overview'],
    queryFn: reportsApi.getMonthlySalesOverview,
  });

  const { data: topProducts = [], isLoading: loadingTopProducts, refetch: refetchTopProducts } = useQuery({
    queryKey: ['monthly-top-products'],
    queryFn: reportsApi.getMonthlyTopProducts,
  });

  const { data: topCustomers = [], isLoading: loadingTopCustomers, refetch: refetchTopCustomers } = useQuery({
    queryKey: ['monthly-top-customers'],
    queryFn: reportsApi.getMonthlyTopCustomers,
  });

  const { data: categoryPerformance = [], isLoading: loadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['monthly-category-performance'],
    queryFn: reportsApi.getMonthlyCategoryPerformance,
  });

  const { data: productSales = [], isLoading: loadingProductSales, refetch: refetchProductSales } = useQuery({
    queryKey: ['monthly-product-sales'],
    queryFn: reportsApi.getMonthlyProductSales,
  });

  const { data: customerPurchases = [], isLoading: loadingCustomerPurchases, refetch: refetchCustomerPurchases } = useQuery({
    queryKey: ['monthly-customer-purchases'],
    queryFn: reportsApi.getMonthlyCustomerPurchases,
  });

  // Auto-detect latest available month/year from data
  useEffect(() => {
    if (salesOverview.length > 0) {
      const latest = salesOverview[0];
      if (latest.year && latest.month) {
        setSelectedYear(latest.year);
        setSelectedMonth(latest.month);
      }
    } else if (topProducts.length > 0) {
      const latest = topProducts[0];
      if (latest.year && latest.month) {
        setSelectedYear(latest.year);
        setSelectedMonth(latest.month);
      }
    }
  }, [salesOverview, topProducts]);

  // Filter data based on selected month/year
  const filteredSalesOverview = salesOverview.filter(s => s.year === selectedYear && s.month === selectedMonth);
  const filteredTopProducts = topProducts.filter(p => p.year === selectedYear && p.month === selectedMonth);
  const filteredTopCustomers = topCustomers.filter(c => c.year === selectedYear && c.month === selectedMonth);
  const filteredCategories = categoryPerformance.filter(c => c.year === selectedYear && c.month === selectedMonth);
  const filteredProductSales = productSales.filter(p => p.year === selectedYear && p.month === selectedMonth);
  const filteredCustomerPurchases = customerPurchases.filter(c => c.year === selectedYear && c.month === selectedMonth);

  const handleRefreshAll = () => {
    refetchOverview();
    refetchTopProducts();
    refetchTopCustomers();
    refetchCategories();
    refetchProductSales();
    refetchCustomerPurchases();
  };

  const monthLabel = getMonthOptions().find(m => m.value === selectedMonth)?.label || '';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Monthly Reports</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive monthly business analytics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month/Year Selector */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1 border border-border">
            <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="w-[130px] border-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions().map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-[90px] border-0 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getYearOptions().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleRefreshAll} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="top-products" className="gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Top Products</span>
          </TabsTrigger>
          <TabsTrigger value="top-customers" className="gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Top Customers</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
            <FolderOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Categories</span>
          </TabsTrigger>
          <TabsTrigger value="product-sales" className="gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Products</span>
          </TabsTrigger>
          <TabsTrigger value="customer-purchases" className="gap-2 data-[state=active]:bg-background text-xs sm:text-sm">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Customers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SalesOverviewTab 
            data={filteredSalesOverview} 
            isLoading={loadingOverview} 
          />
        </TabsContent>

        <TabsContent value="top-products" className="mt-6">
          <TopProductsTab 
            data={filteredTopProducts} 
            isLoading={loadingTopProducts} 
            monthLabel={monthLabel}
            year={selectedYear}
          />
        </TabsContent>

        <TabsContent value="top-customers" className="mt-6">
          <TopCustomersTab 
            data={filteredTopCustomers} 
            isLoading={loadingTopCustomers}
            monthLabel={monthLabel}
            year={selectedYear}
          />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryPerformanceTab 
            data={filteredCategories} 
            isLoading={loadingCategories} 
          />
        </TabsContent>

        <TabsContent value="product-sales" className="mt-6">
          <ProductSalesTab 
            data={filteredProductSales} 
            isLoading={loadingProductSales}
            monthLabel={monthLabel}
            year={selectedYear}
          />
        </TabsContent>

        <TabsContent value="customer-purchases" className="mt-6">
          <CustomerPurchasesTab 
            data={filteredCustomerPurchases} 
            isLoading={loadingCustomerPurchases}
            monthLabel={monthLabel}
            year={selectedYear}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
