import { Heart, Utensils, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const StatItem = ({ icon, label, value }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-mono text-sm text-muted-foreground">{value}%</span>
    </div>
    <Progress value={value} />
  </div>
);

export function StatsPanel({ stats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current State</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatItem
          icon={<Utensils className="h-5 w-5 text-accent" />}
          label="Hunger"
          value={stats.hunger}
        />
        <StatItem
          icon={<Heart className="h-5 w-5 text-accent" />}
          label="Happiness"
          value={stats.happiness}
        />
        <StatItem
          icon={<Zap className="h-5 w-5 text-accent" />}
          label="Energy"
          value={stats.energy}
        />
      </CardContent>
    </Card>
  );
}
