import { Heart, Utensils, Zap, Sword, HeartPulse } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const StatItem = ({ icon, label, value, isNumeric = false }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <span className="font-mono text-sm text-muted-foreground">{value}{!isNumeric && '%'}</span>
    </div>
    {!isNumeric && <Progress value={value} />}
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
          value={stats.hunger ?? 0}
        />
        <StatItem
          icon={<Heart className="h-5 w-5 text-accent" />}
          label="きげん"
          value={stats.happiness ?? 0}
        />
        <StatItem
          icon={<Zap className="h-5 w-5 text-accent" />}
          label="げんき"
          value={stats.energy ?? 0}
        />
        <StatItem
          icon={<HeartPulse className="h-5 w-5 text-accent" />}
          label="けんこう"
          value={stats.health ?? 0}
        />
        <StatItem
          icon={<Sword className="h-5 w-5 text-accent" />}
          label="つよさ"
          value={stats.strength ?? 0}
          isNumeric={true}
        />
      </CardContent>
    </Card>
  );
}
