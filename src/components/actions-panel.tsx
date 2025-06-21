import { Bed, Gamepad2, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ActionsPanel({ onAction }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>お世話</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-2">
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
      </CardContent>
    </Card>
  );
}
