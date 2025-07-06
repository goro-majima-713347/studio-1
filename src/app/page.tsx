
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Settings, BarChart, Save, Bug } from "lucide-react";
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

const initialStats = { hunger: 70, happiness: 80, energy: 60, strength: 50, health: 100 };
const initialBeing = {
  name: "ぴよちゃん",
  personality: "元気いっぱいのひよこ。おしゃべりと探検が大好き！",
  color: "primary",
  stats: initialStats,
  imageUrl: null,
  actionsSinceFinalEvolution: 0,
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
  { time: "1h ago", ...initialStats, strength: 48 },
  { time: "45m ago", ...initialStats, hunger: 65, happiness: 85, energy: 62, strength: 49 },
  { time: "30m ago", ...initialStats, hunger: 75, happiness: 82, energy: 55, strength: 49 },
  { time: "15m ago", ...initialStats, hunger: 72, happiness: 78, energy: 58, strength: 50 },
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
  const [droppings, setDroppings] = useState([]);

  const updateBeingStats = useCallback((changes: Record<string, number>, otherBeingUpdates: Partial<typeof initialBeing> = {}) => {
    setBeing(prev => {
      const newStats = { ...prev.stats };
      for (const stat in changes) {
        if (Object.prototype.hasOwnProperty.call(changes, stat)) {
          const value = changes[stat];
          const currentStat = newStats[stat] ?? 0;
          if (stat === 'strength') {
            newStats[stat] = Math.max(0, currentStat + value);
          } else {
            newStats[stat] = Math.max(0, Math.min(100, currentStat + value));
          }
        }
      }
      
      setStatsHistory(prevHistory => {
          const newEntry = { time: new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}), ...newStats };
          const newHistory = [...prevHistory, newEntry];
          return newHistory.slice(-100);
      });

      return { ...prev, ...otherBeingUpdates, stats: newStats };
    });
  }, []);

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
              ...initialBeing,
              name: data.name,
              personality: data.personality,
              color: data.color,
              stats: { ...initialStats, ...data.stats },
              imageUrl: data.imageUrl || null,
              actionsSinceFinalEvolution: data.actionsSinceFinalEvolution || 0,
            });
            setTasks(data.tasks || initialTasks);
            setConversation(data.conversation || [{ sender: "being", text: "おかえり！また会えてうれしいな！" }]);
            setStatsHistory(data.statsHistory || initialStatsHistory);
            setSleepCount(data.sleepCount || 0);
            setEvolutionStage(data.evolutionStage || 0);
            setEvolutionType(data.evolutionType || null);
            setDroppings(data.droppings || []);
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
            setBeing({
                ...initialBeing,
                ...data.being,
                stats: { ...initialStats, ...data.being?.stats },
                actionsSinceFinalEvolution: data.being?.actionsSinceFinalEvolution || 0,
            });
            setTasks(data.tasks || initialTasks);
            setConversation(data.conversation || initialConversation);
            setStatsHistory(data.statsHistory || initialStatsHistory);
            setSleepCount(data.sleepCount || 0);
            setEvolutionStage(data.evolutionStage || 0);
            setEvolutionType(data.evolutionType || null);
            setDroppings(data.droppings || []);
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

  const handleAction = (action) => {
    if (action !== 'clean' && evolutionStage === 2) {
      const newActionCount = (being.actionsSinceFinalEvolution || 0) + 1;
      if (newActionCount >= 10) {
        toast({
          title: "輪廻転生！",
          description: `${being.name}は立派な卵を産み、新しいぴよちゃんが誕生しました！`,
          duration: 5000,
        });
        setBeing(prev => ({
          ...initialBeing,
          color: prev.color,
        }));
        setSleepCount(0);
        setEvolutionStage(0);
        setEvolutionType(null);
        setConversation(prev => [...prev, { sender: "being", text: `こんにちは！ぼく、ぴよちゃんだよ。これからよろしくね！` }]);
        setStatsHistory([{ time: new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}), ...initialStats }]);
        setDroppings([]);
        return;
      }
    }

    const otherBeingUpdates = (action !== 'clean' && evolutionStage === 2) ? { actionsSinceFinalEvolution: (being.actionsSinceFinalEvolution || 0) + 1 } : {};

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
        updateBeingStats({ hunger: 20, happiness: 5, energy: -5, strength: 10 }, otherBeingUpdates);
        toastTitle = "おいしい！";

        if (Math.random() < 0.4) { // 40% chance
            setTimeout(() => {
                setDroppings(prev => [...prev, {
                    id: Date.now(),
                    style: {
                        left: `${Math.floor(Math.random() * 80) + 10}%`,
                        bottom: `${Math.floor(Math.random() * 25)}%`,
                    }
                }]);
                toast({
                    variant: "destructive",
                    title: "おっと！",
                    description: `${being.name}が床を汚してしまった！お掃除してあげよう。`,
                });
            }, 1000);
        }
        break;
      }
      case "play":
        updateBeingStats({ hunger: -10, happiness: 20, energy: -15 }, otherBeingUpdates);
        toastTitle = "楽しかった！";
        break;
      case "sleep": {
        const newSleepCount = sleepCount + 1;
        setSleepCount(newSleepCount);
        const statChanges = { hunger: -5, happiness: 5, energy: 40 };

        if (newSleepCount >= 10 && evolutionStage < 2) {
          setEvolutionStage(2);
          let newBeingState: Partial<typeof initialBeing>;
          if (being.stats.happiness > 80) {
            setEvolutionType('queen');
            newBeingState = {
              name: "ニワトリクイーン",
              personality: "優雅で気品のあるニワトリの女王。みんなに優しい。",
              imageUrl: null,
              actionsSinceFinalEvolution: 0,
            };
            toast({
              title: "究極の進化！",
              description: `コケこっこが、気品あふれるニワトリクイーンに進化した！`,
              duration: 5000,
            });
          } else {
            setEvolutionType('king');
            newBeingState = {
              name: "ニワトリキング",
              personality: "威厳あふれるニワトリの王。風格が漂う。",
              imageUrl: null,
              actionsSinceFinalEvolution: 0,
            };
            toast({
              title: "さらなる進化！",
              description: `コケこっこが、威厳あるニワトリキングに進化した！`,
              duration: 5000,
            });
          }
          updateBeingStats(statChanges, newBeingState);
          return;
        }

        if (newSleepCount >= 5 && evolutionStage < 1) {
          setEvolutionStage(1);
          updateBeingStats(statChanges, {
            name: "コケこっこ",
            personality: "りっぱなニワトリに成長した！自信に満ちあふれている。",
            imageUrl: null,
          });
          toast({
            title: "おめでとう！",
            description: `ぴよちゃんが、りっぱなニワトリに進化した！`,
            duration: 5000,
          });
          return;
        }
        
        updateBeingStats(statChanges, otherBeingUpdates);
        toastTitle = "おはよう！";
        break;
      }
      case "clean": {
        if (droppings.length === 0) {
          toast({ title: "おそうじ完了！", description: "周りはすでにきれいです。" });
          return;
        }
        const healthGained = droppings.length * 5;
        updateBeingStats({ health: healthGained });
        setDroppings([]);
        toast({
          title: "きれいになった！",
          description: `${being.name}はスッキリして喜んでいる！`,
        });
        return;
      }
      default:
        return;
    }
    
    toast({
      title: toastTitle,
      description: `${being.name}の様子が少し変わったよ。`,
    });
  };

  const handleDebugRun = () => {
    let tempBeing = JSON.parse(JSON.stringify(being));
    let tempSleepCount = sleepCount;
    let tempEvolutionStage = evolutionStage;
    let tempEvolutionType = evolutionType;
    let tempStatsHistory = [...statsHistory];
    let tempDroppings = [...droppings];
    
    const actions = ["feed", "play", "sleep", "clean"];

    const applyStatChanges = (changes, otherUpdates = {}) => {
        const newStats = { ...tempBeing.stats };
        for (const stat in changes) {
            const value = changes[stat];
            const currentStat = newStats[stat] ?? 0;
            if (stat === 'strength') {
                newStats[stat] = Math.max(0, currentStat + value);
            } else {
                newStats[stat] = Math.max(0, Math.min(100, currentStat + value));
            }
        }
        tempBeing.stats = newStats;
        Object.assign(tempBeing, otherUpdates);
        const newEntry = { time: new Date().toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'}), ...newStats };
        tempStatsHistory.push(newEntry);
    };

    for (let i = 0; i < 10; i++) {
        if (tempEvolutionStage === 2) {
            const newActionCount = (tempBeing.actionsSinceFinalEvolution || 0) + 1;
            if (newActionCount >= 10) {
                const currentColor = tempBeing.color;
                tempBeing = JSON.parse(JSON.stringify(initialBeing));
                tempBeing.color = currentColor;
                tempSleepCount = 0;
                tempEvolutionStage = 0;
                tempEvolutionType = null;
                tempDroppings = [];
                continue;
            }
        }

        const otherUpdates = tempEvolutionStage === 2 ? { actionsSinceFinalEvolution: (tempBeing.actionsSinceFinalEvolution || 0) + 1 } : {};

        const randomAction = actions[Math.floor(Math.random() * actions.length)];
        
        switch(randomAction) {
            case "feed": {
                if (tempBeing.stats.hunger < 100) {
                    applyStatChanges({ hunger: 20, happiness: 5, energy: -5, strength: 10 }, otherUpdates);
                    if (Math.random() < 0.4) {
                       tempDroppings.push({
                           id: Date.now() + i,
                           style: {
                               left: `${Math.floor(Math.random() * 80) + 10}%`,
                               bottom: `${Math.floor(Math.random() * 25)}%`,
                           }
                       });
                    }
                }
                break;
            }
            case "play": {
                applyStatChanges({ hunger: -10, happiness: 20, energy: -15 }, otherUpdates);
                break;
            }
            case "sleep": {
                const newSleepCount = tempSleepCount + 1;
                tempSleepCount = newSleepCount;
                const statChanges = { hunger: -5, happiness: 5, energy: 40 };
                
                if (newSleepCount >= 10 && tempEvolutionStage < 2) {
                    tempEvolutionStage = 2;
                    let newBeingState;
                    if (tempBeing.stats.happiness > 80) {
                        tempEvolutionType = 'queen';
                        newBeingState = { name: "ニワトリクイーン", personality: "優雅で気品のあるニワトリの女王。みんなに優しい。", imageUrl: null, actionsSinceFinalEvolution: 0 };
                    } else {
                        tempEvolutionType = 'king';
                        newBeingState = { name: "ニワトリキング", personality: "威厳あふれるニワトリの王。風格が漂う。", imageUrl: null, actionsSinceFinalEvolution: 0 };
                    }
                    applyStatChanges(statChanges, newBeingState);
                } else if (newSleepCount >= 5 && tempEvolutionStage < 1) {
                    tempEvolutionStage = 1;
                    applyStatChanges(statChanges, { name: "コケこっこ", personality: "りっぱなニワトリに成長した！自信に満ちあふれている。", imageUrl: null });
                } else {
                    applyStatChanges(statChanges, otherUpdates);
                }
                break;
            }
            case "clean": {
                if (tempDroppings.length > 0) {
                    const healthGained = tempDroppings.length * 5;
                    applyStatChanges({ health: healthGained });
                    tempDroppings = [];
                }
                break;
            }
        }
    }
    
    setBeing(tempBeing);
    setSleepCount(tempSleepCount);
    setEvolutionStage(tempEvolutionStage);
    if (tempEvolutionType) {
        setEvolutionType(tempEvolutionType);
    }
    setStatsHistory(tempStatsHistory.slice(-100));
    setDroppings(tempDroppings);
    
    toast({
        title: "デバッグ実行！",
        description: "お世話を10回ランダムで行いました。",
    });
  };

  const handleTaskToggle = (taskId) => {
    const newTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(newTasks);

    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      updateBeingStats({ happiness: 15 });
      toast({
        title: "タスク完了！",
        description: `${being.name}は達成して誇らしい気持ち！`,
      });
    }
  };

  const handleNewMessage = (message) => {
    setConversation(prev => [...prev, message]);
    if(message.sender === 'user') {
      updateBeingStats({ happiness: 5 });
    }
  };

  const handleSave = async () => {
    const hasFirebaseConfig = hasFullFirebaseConfig;

    const dataToSave = {
        ...being,
        tasks,
        conversation,
        statsHistory,
        sleepCount,
        evolutionStage,
        evolutionType,
        droppings,
    };

    if (hasFirebaseConfig) {
      const beingRef = doc(db, "beings", BEING_ID);
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
      const decay = { hunger: -2, happiness: -1, energy: -1 };
      if (droppings.length > 0) {
        decay.health = -5 * droppings.length;
      }
      updateBeingStats(decay);
    }, 60000); 

    return () => clearInterval(interval);
  }, [updateBeingStats, droppings]);

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
           <Button variant="ghost" size="icon" onClick={handleDebugRun}>
             <Bug className="h-5 w-5" />
             <span className="sr-only">デバッグ実行</span>
           </Button>
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
            droppings={droppings}
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
