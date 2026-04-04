import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Legend } from "recharts";
import { useGetCategoryBreakdown } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryBreakdownChart() {
  const { data: breakdownData, isLoading } = useGetCategoryBreakdown();

  if (isLoading) {
    return <Skeleton className="w-full h-[350px] bg-secondary/50 rounded-xl" />;
  }

  if (!breakdownData || breakdownData.length === 0) {
    return (
      <Card className="h-[350px] flex items-center justify-center border-border bg-card/50">
        <CardDescription>No category data available.</CardDescription>
      </Card>
    );
  }

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--primary))',
  ];

  return (
    <Card className="border-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-lg font-mono tracking-tight text-primary">Spending Breakdown</CardTitle>
        <CardDescription>Distribution across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="amount"
                nameKey="category"
              >
                {breakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--popover))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--popover-foreground))',
                  boxShadow: 'var(--shadow-md)'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
