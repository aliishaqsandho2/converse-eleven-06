import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, CreditCard, Banknote, AlertCircle } from "lucide-react";
import { MonthlyCustomerPurchase } from "@/services/reportsApi";

interface CustomerPurchasesTabProps {
  data: MonthlyCustomerPurchase[];
  isLoading: boolean;
  monthLabel?: string;
  year?: number;
}

const formatCurrency = (value: string | number) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export function CustomerPurchasesTab({ data, isLoading, monthLabel, year }: CustomerPurchasesTabProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("value");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No Customer Data</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            No customer purchases data available for {monthLabel} {year}
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredData = data
    .filter(c => 
      (c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
       c.customer_phone.includes(search))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "value":
          return parseFloat(b.total_purchase_value) - parseFloat(a.total_purchase_value);
        case "orders":
          return b.times_purchased - a.times_purchased;
        case "balance":
          return parseFloat(b.outstanding_balance) - parseFloat(a.outstanding_balance);
        default:
          return 0;
      }
    });

  const totalPurchases = filteredData.reduce((sum, c) => sum + parseFloat(c.total_purchase_value), 0);
  const totalOutstanding = filteredData.reduce((sum, c) => sum + parseFloat(c.outstanding_balance), 0);
  const totalCash = filteredData.reduce((sum, c) => sum + parseFloat(c.cash_purchases), 0);
  const totalCredit = filteredData.reduce((sum, c) => sum + parseFloat(c.credit_purchases), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Customer Purchases
          </h2>
          <p className="text-muted-foreground mt-1">
            {monthLabel} {year} • Detailed customer purchase breakdown
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2 text-sm">
          {filteredData.length} Customers
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPurchases)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
            <Banknote className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCash)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCredit)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border-orange-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">Purchase Value</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="balance">Outstanding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Purchase Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Customer</TableHead>
                  <TableHead className="text-right font-semibold">Orders</TableHead>
                  <TableHead className="text-right font-semibold">Items</TableHead>
                  <TableHead className="text-right font-semibold">Cash</TableHead>
                  <TableHead className="text-right font-semibold">Total</TableHead>
                  <TableHead className="text-right font-semibold">Credit/Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((customer) => {
                  const creditPlusOutstanding = parseFloat(customer.credit_purchases) + parseFloat(customer.outstanding_balance);
                  return (
                    <TableRow 
                      key={`${customer.customer_id}-${customer.month}`}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{customer.customer_name}</div>
                          <div className="text-sm text-muted-foreground">{customer.customer_phone}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{customer.times_purchased}</TableCell>
                      <TableCell className="text-right tabular-nums">{customer.total_items_purchased.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-emerald-600 tabular-nums">{formatCurrency(customer.cash_purchases)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">{formatCurrency(customer.total_purchase_value)}</TableCell>
                      <TableCell className="text-right">
                        <span className={creditPlusOutstanding > 0 ? 'text-orange-600 font-medium tabular-nums' : 'tabular-nums'}>
                          {formatCurrency(creditPlusOutstanding)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
