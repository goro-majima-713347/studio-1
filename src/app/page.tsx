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
  { id: 1, text: "15分間本を読む", completed: false },
  { id: 2, text: "パズルを解く", completed: false },
  { id: 3, text: "新しいスキルを練習する", completed: true },
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
    name: "ぴよちゃん",
    personality: "元気いっぱいのひよこ。おしゃべりと探検が大好き！",
    color: "primary",
    stats: initialStats,
  });
  const [tasks, setTasks] = useState(initialTasks);
  const [conversation, setConversation] = useState([
    { sender: "being", text: `こんにちは！ぼく、ぴよちゃんだよ。これからよろしくね！` },
  ]);
  const [statsHistory, setStatsHistory] = useState(initialStatsHistory);
  const [sleepCount, setSleepCount] = useState(0);
  const [evolutionStage, setEvolutionStage] = useState(0);
  const [evolutionType, setEvolutionType] = useState(null);

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
        toastTitle = "おいしい！";
        break;
      case "play":
        statChanges = { hunger: -10, happiness: 20, energy: -15 };
        toastTitle = "楽しかった！";
        break;
      case "sleep": {
        const newSleepCount = sleepCount + 1;
        setSleepCount(newSleepCount);
        statChanges = { hunger: -5, happiness: 5, energy: 40 };

        if (newSleepCount >= 10 && evolutionStage < 2) {
          setEvolutionStage(2);
          updateStat("hunger", statChanges.hunger);
          updateStat("happiness", statChanges.happiness);
          updateStat("energy", statChanges.energy);

          if (being.stats.happiness > 80) {
            setEvolutionType('queen');
            setBeing(prev => ({
              ...prev,
              name: "ニワトリクイーン",
              personality: "優雅で気品のあるニワトリの女王。みんなに優しい。",
            }));
            toast({
              title: "究極の進化！",
              description: `コケこっこが、気品あふれるニワトリクイーンに進化した！`,
              duration: 5000,
            });
          } else {
            setEvolutionType('king');
            setBeing(prev => ({
              ...prev,
              name: "ニワトリキング",
              personality: "威厳あふれるニワトリの王。風格が漂う。",
            }));
            toast({
              title: "さらなる進化！",
              description: `コケこっこが、威厳あるニワトリキングに進化した！`,
              duration: 5000,
            });
          }
          return;
        }

        if (newSleepCount >= 5 && evolutionStage < 1) {
          setEvolutionStage(1);
          updateStat("hunger", statChanges.hunger);
          updateStat("happiness", statChanges.happiness);
          updateStat("energy", statChanges.energy);
          setBeing(prev => ({
            ...prev,
            name: "コケこっこ",
            personality: "りっぱなニワトリに成長した！自信に満ちあふれている。",
          }));
          toast({
            title: "おめでとう！",
            description: `ぴよちゃんが、りっぱなニワトリに進化した！`,
            duration: 5000,
          });
          return;
        }
        
        toastTitle = "おはよう！";
        break;
      }
      default:
        return;
    }
    
    updateStat("hunger", statChanges.hunger);
    updateStat("happiness", statChanges.happiness);
    updateStat("energy", statChanges.energy);

    toast({
      title: toastTitle,
      description: `${being.name}の様子が少し変わったよ。`,
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
        title: "タスク完了！",
        description: `${being.name}は達成して誇らしい気持ち！`,
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
      title: "変更を保存しました！",
      description: `${being.name}の見た目や性格が変わったよ！`,
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
          <p className="text-muted-foreground font-headline">新しいおともだちが、あなたを待っています。</p>
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
                  <SheetTitle>これまでの記録</SheetTitle>
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
          <VirtualBeing name={being.name} color={being.color} evolutionStage={evolutionStage} evolutionType={evolutionType} />
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
