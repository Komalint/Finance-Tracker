import { useGetDashboardSummary, useListTransactions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { CategoryBreakdownChart } from "@/components/charts/category-breakdown-chart";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, TrendingUp, Activity } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: transactions, isLoading: isLoadingTx } = useListTransactions();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Net Worth" 
          value={summary?.totalBalance} 
          icon={<Wallet className="h-4 w-4 text-primary" />} 
          loading={isLoadingSummary} 
          trend={undefined}
        />
        <SummaryCard 
          title="Monthly Income" 
          value={summary?.monthlyIncome} 
          icon={<ArrowDownRight className="h-4 w-4 text-chart-2" />} 
          loading={isLoadingSummary} 
          className="text-chart-2"
        />
        <SummaryCard 
          title="Monthly Expenses" 
          value={summary?.monthlyExpenses} 
          icon={<ArrowUpRight className="h-4 w-4 text-destructive" />} 
          loading={isLoadingSummary} 
          className="text-destructive"
        />
        <SummaryCard 
          title="Monthly Savings" 
          value={summary?.monthlySavings} 
          icon={<TrendingUp className="h-4 w-4 text-chart-1" />} 
          loading={isLoadingSummary} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendChart />
        <CategoryBreakdownChart />
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle className="text-lg font-mono tracking-tight text-primary">Recent Transactions</CardTitle>
            <CardDescription>Your latest ledger entries</CardDescription>
          </div>
          <Link href="/transactions">
            <Button variant="outline" size="sm" className="font-mono text-xs uppercase tracking-widest border-border hover:bg-secondary">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingTx ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-12 w-full bg-secondary/50 rounded-md" />
              <Skeleton className="h-12 w-full bg-secondary/50 rounded-md" />
              <Skeleton className="h-12 w-full bg-secondary/50 rounded-md" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm font-mono uppercase tracking-widest">
              No transactions found.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-chart-2/10 text-chart-2' : 'bg-destructive/10 text-destructive'}`}>
                      {tx.type === 'income' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                        <span className="uppercase tracking-wider text-[10px] font-mono px-1.5 py-0.5 bg-secondary rounded-sm">{tx.category}</span>
                        <span>{format(new Date(tx.date), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`font-mono font-medium ${tx.type === 'income' ? 'text-chart-2' : 'text-foreground'}`}>
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, icon, loading, trend, className }: { title: string, value?: number, icon: React.ReactNode, loading: boolean, trend?: string, className?: string }) {
  return (
    <Card className="border-border bg-card/50 overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24 bg-secondary" />
        ) : (
          <div className="flex flex-col">
            <span className={`text-3xl font-bold font-mono tracking-tighter ${className || 'text-foreground'}`}>
              ${value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </span>
            {trend && <span className="text-xs text-muted-foreground mt-1">{trend}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
