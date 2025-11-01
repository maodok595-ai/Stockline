import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: number;
  trend?: 'up' | 'down';
  subtitle?: string;
}

export function KPICard({ title, value, icon: Icon, change, trend, subtitle }: KPICardProps) {
  return (
    <Card className="hover-elevate">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold font-mono text-foreground">{value}</h3>
              {change !== undefined && (
                <span className={`text-sm font-medium flex items-center gap-1 ${
                  trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
