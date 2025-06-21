"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Settings, BarChart, Save } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

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
import { Skeleton } from "@/components/ui/skeleton";
import { handleImageGeneration } from "@/app/actions";

const initialStats = { hunger: 70, happiness: 80, energy: 60, strength: 50 };
const initialBeing = {
  name: "ぴよちゃん",
  personality: "元気いっぱいのひよこ。おしゃべりと探検が大好き！",
  color: "primary",
  stats: initialStats,
  imageUrl: null,
};
const initialTasks = [
  { id: 1, text: "15分間本を読む", completed: false },
  { id: 2, text: "パズルを解く", completed: false },
  { id: 3, text: "新しいスキルを練習する", completed: true },
];
const initialConversation = [
  { sender: "being", text: `こんにちは！ぼく、ぴよちゃんだよ。これからよろしくね！` },
];

const initialStatsHistory = [
  { time: "1h ago", hunger: 70, happiness: 80, energy: 60, strength: 48 },
  { time: "45m ago", hunger: 65, happiness: 85, energy: 62, strength: 49 },
  { time: "30m ago", hunger: 75, happiness: 82, energy: 55, strength: 49 },
  { time: "15m ago", hunger: 72, happiness: 78, energy: 58, strength: 50 },
  { time: "now", ...initialStats },
];

const hasFullFirebaseConfig =
  !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

const BEING_ID = "piyo-chan-01";

export default function Home() {
  const { toast } = useToast();
  const [being, setBeing] = useState(initialBeing);
  const [tasks, setTasks] = useState(initialTasks);
  const [conversation, setConversation] = useState(initialConversation);
  const [statsHistory, setStatsHistory] = useState(initialStatsHistory);
  const [sleepCount, setSleepCount] = useState(0);
  const [evolutionStage, setEvolutionStage] = useState(0);
  const [evolutionType, setEvolutionType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const hasFirebaseConfig = hasFullFirebaseConfig;

      if (hasFirebaseConfig) {
        console.log("Loading data from Firestore...");
        const beingRef = doc(db, "beings", BEING_ID);
        try {
          const docSnap = await getDoc(beingRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setBeing({
              name: data.name,
              personality: data.personality,
              color: data.color,
              stats: { ...initialStats, ...data.stats },
              imageUrl: data.imageUrl || null,
            });
            setTasks(data.tasks || initialTasks);
            setConversation(data.conversation || [{ sender: "being", text: "おかえり！また会えてうれしいな！" }]);
            setStatsHistory(data.statsHistory || initialStatsHistory);
            setSleepCount(data.sleepCount || 0);
            setEvolutionStage(data.evolutionStage || 0);
            setEvolutionType(data.evolutionType || null);
            console.log("Data loaded from Firestore.");
          } else {
            console.log("No existing data in Firestore, initializing a new being.");
          }
        } catch (error) {
          console.error("Error loading data from Firestore: ", error);
          toast({
            variant: "destructive",
            title: "データの読み込みに失敗しました",
            description: "クラウドから記録を読み込めませんでした。",
          });
        }
      } else {
        console.warn("Firebase config not found, using local storage.");
        try {
          const savedData = localStorage.getItem(BEING_ID);
          if (savedData) {
            const data = JSON.parse(savedData);
            setBeing({ ...initialBeing, ...data.being, stats: { ...initialStats, ...data.being?.stats } });
            setTasks(data.tasks || initialTasks);
            setConversation(data.conversation || initialConversation);
            setStatsHistory(data.statsHistory || initialStatsHistory);
            setSleepCount(data.sleepCount || 0);
            setEvolutionStage(data.evolutionStage || 0);
            setEvolutionType(data.evolutionType || null);
            console.log("Data loaded from local storage.");
          } else {
            console.log("No data in local storage.");
          }
        } catch (error) {
            console.error("Error loading data from localStorage: ", error);
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, [toast]);

  const updateStat = useCallback((stat, value) => {
    setBeing(prev => {
      const currentStat = prev.stats[stat] ?? 0;
      let newStatValue;
      
      if (stat === 'strength') {
        newStatValue = Math.max(0, currentStat + value);
      } else {
        newStatValue = Math.max(0, Math.min(100, currentStat + value));
      }

      const newStats = { ...prev.stats, [stat]: newStatValue };
      
      setStatsHistory(prevHistory => {
          const newEntry = { time: "now", ...newStats };
          return [...prevHistory.slice(-9), newEntry];
      });

      return { ...prev, stats: newStats };
    });
  }, []);

  const handleAction = (action) => {
    let statChanges;
    let toastTitle;

    switch (action) {
      case "feed": {
        if (being.stats.hunger >= 100) {
          toast({
            title: "おなかいっぱい！",
            description: `${being.name}はもうおなかがいっぱいのようだ。`,
          });
          return;
        }
        statChanges = { hunger: 20, happiness: 5, energy: -5, strength: 10 };
        toastTitle = "おいしい！";
        break;
      }
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
              imageUrl: null,
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
              imageUrl: null,
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
            imageUrl: null,
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
    
    for (const stat in statChanges) {
      if (Object.prototype.hasOwnProperty.call(statChanges, stat)) {
        updateStat(stat, statChanges[stat]);
      }
    }

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

  const handleSave = async () => {
    const hasFirebaseConfig = hasFullFirebaseConfig;

    if (hasFirebaseConfig) {
      const beingRef = doc(db, "beings", BEING_ID);
      const dataToSave = {
        ...being,
        tasks,
        conversation,
        statsHistory,
        sleepCount,
        evolutionStage,
        evolutionType,
      };
      try {
        await setDoc(beingRef, dataToSave);
        toast({
          title: "セーブしました！",
          description: "ぴよちゃんの記録をクラウドに保存しました。",
        });
      } catch (error) {
        console.error("Error saving data to Firestore: ", error);
        toast({
          variant: "destructive",
          title: "セーブに失敗しました",
          description: "記録をクラウドに保存できませんでした。",
        });
      }
    } else {
      const dataToSave = {
        being,
        tasks,
        conversation,
        statsHistory,
        sleepCount,
        evolutionStage,
        evolutionType,
      };
      try {
        localStorage.setItem(BEING_ID, JSON.stringify(dataToSave));
        toast({
          title: "ローカルに保存しました",
          description: "ぴよちゃんの記録をブラウザに保存しました。",
        });
      } catch (error) {
        console.error("Error saving to localStorage", error);
        toast({
          variant: "destructive",
          title: "セーブに失敗しました",
          description: "ブラウザに記録を保存できませんでした。",
        });
      }
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

  const handleGenerateImage = async (prompt) => {
    if (isGeneratingImage) return;

    setIsGeneratingImage(true);
    toast({
      title: "画像を生成中...",
      description: "新しい姿を想像しています。少しお待ちください。",
    });

    const newImageUrl = await handleImageGeneration(prompt);

    if (newImageUrl) {
        setBeing(prev => ({ ...prev, imageUrl: newImageUrl }));
        toast({
            title: "画像ができました！",
            description: `${being.name}の新しい姿を見てみよう！`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "画像の生成に失敗しました",
            description: "もう一度試してみてください。",
        });
    }
    setIsGeneratingImage(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateStat("hunger", -2);
      updateStat("happiness", -1);
      updateStat("energy", -1);
    }, 60000); 

    return () => clearInterval(interval);
  }, [updateStat]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-body p-4 lg:p-8 animate-pulse">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-headline font-bold text-primary-foreground/90">NurtureVerse</h1>
            <p className="text-muted-foreground font-headline">新しいおともだちが、あなたを待っています。</p>
          </div>
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="lg:col-span-1 flex flex-col items-center justify-center order-first lg:order-none">
            <Skeleton className="h-64 w-64 rounded-full" />
            <Skeleton className="h-9 w-48 mt-4" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-full w-full min-h-[400px]" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body p-4 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-primary-foreground/90">NurtureVerse</h1>
          <p className="text-muted-foreground font-headline">新しいおともだちが、あなたを待っています。</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={handleSave}>
             <Save className="h-5 w-5" />
             <span className="sr-only">データを保存</span>
           </Button>
           <Sheet>
             <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <BarChart className="h-5 w-5" />
                  <span className="sr-only">これまでの記録を見る</span>
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
                 <span className="sr-only">カスタマイズ</span>
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
          <VirtualBeing
            name={being.name}
            color={being.color}
            evolutionStage={evolutionStage}
            evolutionType={evolutionType}
            imageUrl={being.imageUrl}
            onGenerateImage={handleGenerateImage}
            isGeneratingImage={isGeneratingImage}
          />
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
