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
        <CardTitle>今の状態</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <StatItem
          icon={<Utensils className="h-5 w-5 text-accent" />}
          label="おなか"
          value={stats.hunger}
        />
        <StatItem
          icon={<Heart className="h-5 w-5 text-accent" />}
          label="きげん"
          value={stats.happiness}
        />
        <StatItem
          icon={<Zap className="h-5 w-5 text-accent" />}
          label="げんき"
          value={stats.energy}
        />
      </CardContent>
    </Card>
  );
}
