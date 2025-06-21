"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Settings, BarChart } from "lucide-react";

import { VirtualBeing } from "@/components/virtual-being";
import { StatsPanel } from "@/components/stats-panel";
import { ActionsPanel } from "@/components/actions-panel";
import { TasksPanel } from "@/components/tasks-panel";
import { InteractionPanel } from "@/components/interaction-panel";
import { CustomizationDrawer } from "@/components/customization-drawer";
import { ProgressChart } from "@/components/progress-chart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const initialStats = { hunger: 70, happiness: 80, energy: 60 };
const initialTasks = [
  { id: 1, text: "Read a book for 15 minutes", completed: false },
  { id: 2, text: "Solve a puzzle", completed: false },
  { id: 3, text: "Practice a new skill", completed: true },
];

const initialStatsHistory = [
  { time: "1h ago", ...initialStats },
  { time: "45m ago", hunger: 65, happiness: 85, energy: 62 },
  { time: "30m ago", hunger: 75, happiness: 82, energy: 55 },
  { time: "15m ago", hunger: 72, happiness: 78, energy: 58 },
  { time: "now", ...initialStats },
];

export default function Home() {
  const { toast } = useToast();
  const [being, setBeing] = useState({
    name: "Aether",
    personality: "Curious, gentle, and a bit shy. Loves learning new things.",
    color: "primary",
    stats: initialStats,
  });
  const [tasks, setTasks] = useState(initialTasks);
  const [conversation, setConversation] = useState([
    { sender: "being", text: `Hello! I'm ${being.name}. It's nice to meet you.` },
  ]);
  const [statsHistory, setStatsHistory] = useState(initialStatsHistory);

  const updateStat = useCallback((stat, value) => {
    setBeing(prev => {
      const newStatValue = Math.max(0, Math.min(100, prev.stats[stat] + value));
      const newStats = { ...prev.stats, [stat]: newStatValue };
      
      setStatsHistory(prevHistory => {
          const newEntry = { time: "now", ...newStats };
          // Keep history to a reasonable length
          return [...prevHistory.slice(-9), newEntry];
      });

      return { ...prev, stats: newStats };
    });
  }, []);

  const handleAction = (action) => {
    let statChanges;
    let toastTitle;

    switch (action) {
      case "feed":
        statChanges = { hunger: 20, happiness: 5, energy: -5 };
        toastTitle = "Yummy!";
        break;
      case "play":
        statChanges = { hunger: -10, happiness: 20, energy: -15 };
        toastTitle = "That was fun!";
        break;
      case "sleep":
        statChanges = { hunger: -5, happiness: 5, energy: 40 };
        toastTitle = "Good morning!";
        break;
      default:
        return;
    }
    
    updateStat("hunger", statChanges.hunger);
    updateStat("happiness", statChanges.happiness);
    updateStat("energy", statChanges.energy);

    toast({
      title: toastTitle,
      description: `${being.name} feels a little different now.`,
    });
  };

  const handleTaskToggle = (taskId) => {
    const newTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);

    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      updateStat("happiness", 15);
      toast({
        title: "Task Complete!",
        description: `${being.name} is proud of their achievement!`,
      });
    }
  };

  const handleNewMessage = (message) => {
    setConversation(prev => [...prev, message]);
    if(message.sender === 'user') {
      updateStat('happiness', 5);
    }
  };
  
  const handleSaveCustomization = (newName, newPersonality, newColor) => {
    setBeing(prev => ({
      ...prev,
      name: newName,
      personality: newPersonality,
      color: newColor,
    }));
    toast({
      title: "Changes Saved!",
      description: `${being.name} has a new look and feel!`,
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateStat("hunger", -2);
      updateStat("happiness", -1);
      updateStat("energy", -1);
    }, 60000); // Decrease stats every minute

    return () => clearInterval(interval);
  }, [updateStat]);

  return (
    <div className="min-h-screen bg-background text-foreground font-body p-4 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary-foreground/90">NurtureVerse</h1>
          <p className="text-muted-foreground font-headline">A new friend awaits you.</p>
        </div>
        <div className="flex items-center gap-2">
           <Sheet>
             <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <BarChart className="h-5 w-5" />
                  <span className="sr-only">View Stats History</span>
                </Button>
             </SheetTrigger>
             <SheetContent>
                <SheetHeader>
                  <SheetTitle>Stats History</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <ProgressChart data={statsHistory} />
                </div>
             </SheetContent>
           </Sheet>
           
           <CustomizationDrawer 
             being={being} 
             onSave={handleSaveCustomization}
             trigger={
               <Button variant="ghost" size="icon">
                 <Settings className="h-5 w-5" />
                 <span className="sr-only">Customize Being</span>
               </Button>
             }
           />
        </div>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <StatsPanel stats={being.stats} />
           <ActionsPanel onAction={handleAction} />
           <TasksPanel tasks={tasks} onToggle={handleTaskToggle} />
        </div>
        
        <div className="lg:col-span-1 flex flex-col items-center justify-center order-first lg:order-none">
          <VirtualBeing name={being.name} color={being.color} />
        </div>
        
        <div className="lg:col-span-1">
          <InteractionPanel
            beingName={being.name}
            personality={being.personality}
            conversation={conversation}
            onNewMessage={handleNewMessage}
          />
        </div>
      </main>
    </div>
  );
}
