import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { useGetMonthlyTrend } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MonthlyTrendChart() {
  const { data: trendData, isLoading } = useGetMonthlyTrend();

  if (isLoading) {
    return <Skeleton className="w-full h-[350px] bg-secondary/50 rounded-xl" />;
  }

  if (!trendData || trendData.length === 0) {
    return (
      <Card className="h-[350px] flex items-center justify-center border-border bg-card/50">
        <CardDescription>No monthly trend data available.</CardDescription>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg font-mono tracking-tight text-primary">Monthly Cash Flow</CardTitle>
        <CardDescription>Income vs Expenses over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.4 }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--popover-foreground))',
                  boxShadow: 'var(--shadow-md)'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="income" name="Income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
