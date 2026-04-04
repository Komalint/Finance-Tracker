import { useGetInsights } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingDown, TrendingUp, Target, BarChart4, Crosshair } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Insights() {
  const { data: insights, isLoading } = useGetInsights();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-tight text-primary">ALPHA INSIGHTS</h2>
          <p className="text-sm text-muted-foreground">Synthesized financial telemetry.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 bg-secondary/50 rounded-xl" />
          <Skeleton className="h-40 bg-secondary/50 rounded-xl" />
          <Skeleton className="h-40 bg-secondary/50 rounded-xl" />
        </div>
        <Skeleton className="h-80 bg-secondary/50 rounded-xl" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-20 text-muted-foreground font-mono uppercase tracking-widest">
        Insufficient data for insights generation.
      </div>
    );
  }

  const isMoMPositive = insights.monthOverMonthChange > 0;
  const savingsRateGood = insights.savingsRate >= 20;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-mono tracking-tight text-primary">ALPHA INSIGHTS</h2>
        <p className="text-sm text-muted-foreground">Synthesized financial telemetry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <InsightCard 
          title="Savings Velocity" 
          value={`${insights.savingsRate.toFixed(1)}%`}
          subtitle={savingsRateGood ? "Healthy capitalization." : "Sub-optimal accumulation."}
          icon={<Target className={savingsRateGood ? "text-chart-1" : "text-destructive"} />}
          className={savingsRateGood ? "border-chart-1/30" : "border-destructive/30"}
        />
        
        <InsightCard 
          title="MoM Expenditure" 
          value={`${Math.abs(insights.monthOverMonthChange).toFixed(1)}%`}
          subtitle={isMoMPositive ? "Increased burn rate." : "Reduced burn rate."}
          icon={isMoMPositive ? <TrendingUp className="text-destructive" /> : <TrendingDown className="text-chart-1" />}
          className={isMoMPositive ? "border-destructive/30" : "border-chart-1/30"}
          valuePrefix={isMoMPositive ? "+" : "-"}
          valueColor={isMoMPositive ? "text-destructive" : "text-chart-1"}
        />

        <InsightCard 
          title="Avg Transaction" 
          value={`$${insights.averageTransactionAmount.toFixed(2)}`}
          subtitle="Mean capital deployment."
          icon={<Crosshair className="text-chart-4" />}
          className="border-chart-4/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border bg-card/50 overflow-hidden relative">
          <div className="absolute -right-10 -top-10 text-destructive/5 rotate-12 scale-150">
            <AlertTriangle size={200} />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-mono tracking-tight text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Primary Capital Drain
            </CardTitle>
            <CardDescription>Highest volume expenditure sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <h3 className="text-4xl font-black font-mono tracking-tighter uppercase mb-2">
                {insights.highestSpendingCategory}
              </h3>
              <div className="text-2xl text-muted-foreground font-mono">
                ${insights.highestSpendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-mono tracking-tight text-primary flex items-center gap-2">
              <BarChart4 className="w-5 h-5" />
              Sector Analysis
            </CardTitle>
            <CardDescription>Top expenditure categories by volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 pt-4">
              {insights.topExpenseCategories.map((category, i) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-mono">
                    <span className="uppercase tracking-wider">{category}</span>
                    <span className="text-muted-foreground">Rank #{i + 1}</span>
                  </div>
                  <Progress value={100 - (i * 20)} className={`h-2 bg-secondary ${
                    i === 0 ? '[&>div]:bg-destructive' : 
                    i === 1 ? '[&>div]:bg-chart-4' : 
                    '[&>div]:bg-chart-3'
                  }`} />
                </div>
              ))}
              {insights.topExpenseCategories.length === 0 && (
                <div className="text-center text-muted-foreground font-mono text-sm py-4">No significant sector data.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InsightCard({ title, value, subtitle, icon, className, valuePrefix, valueColor }: any) {
  return (
    <Card className={`border-border bg-card/50 relative overflow-hidden transition-all hover:bg-card border-l-4 ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{title}</h3>
            <div className="flex items-baseline">
              {valuePrefix && <span className={`text-xl font-mono font-bold mr-1 ${valueColor}`}>{valuePrefix}</span>}
              <span className={`text-3xl font-black font-mono tracking-tighter ${valueColor || 'text-foreground'}`}>{value}</span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">{subtitle}</p>
          </div>
          <div className="p-3 bg-secondary/30 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
