import { BookCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function TasksPanel({ tasks, onToggle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookCheck className="h-5 w-5" />
          <span>Growth Tasks</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="flex items-center space-x-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id)}
            />
            <Label
              htmlFor={`task-${task.id}`}
              className={`flex-grow ${task.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {task.text}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
