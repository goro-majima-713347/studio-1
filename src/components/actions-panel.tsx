import { Bed, Gamepad2, Utensils, Trash2, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActionsPanel({ onAction }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>お世話</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-5 gap-2">
        <Button variant="outline" onClick={() => onAction("feed")} className="flex flex-col h-20 gap-1">
          <Utensils className="h-6 w-6" />
          <span>ごはん</span>
        </Button>
        <Button variant="outline" onClick={() => onAction("play")} className="flex flex-col h-20 gap-1">
          <Gamepad2 className="h-6 w-6" />
          <span>あそぶ</span>
        </Button>
        <Button variant="outline" onClick={() => onAction("sleep")} className="flex flex-col h-20 gap-1">
          <Bed className="h-6 w-6" />
          <span>ねる</span>
        </Button>
        <Button variant="outline" onClick={() => onAction("clean")} className="flex flex-col h-20 gap-1">
          <Trash2 className="h-6 w-6" />
          <span>そうじ</span>
        </Button>
        <Button variant="outline" onClick={() => onAction("medicine")} className="flex flex-col h-20 gap-1">
          <Pill className="h-6 w-6" />
          <span>くすり</span>
        </Button>
      </CardContent>
    </Card>
  );
}
