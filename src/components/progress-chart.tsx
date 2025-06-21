"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function ProgressChart({ data }) {
    const chartConfig = {
      hunger: { label: "Hunger", color: "hsl(var(--accent))" },
      happiness: { label: "Happiness", color: "hsl(var(--primary))" },
      energy: { label: "Energy", color: "hsl(var(--chart-4))" },
    }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false}/>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="hunger" stroke={chartConfig.hunger.color} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="happiness" stroke={chartConfig.happiness.color} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="energy" stroke={chartConfig.energy.color} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </ChartContainer>
  )
}
