// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage() {
  const auth = getAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user document already exists, if not, create one.
      // This part can be expanded to initialize user-specific data upon first login.
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { email: user.email, name: user.displayName }, { merge: true });

      toast({ title: "ログインしました", description: "NurtureVerseへようこそ！" });
      router.push("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast({ variant: "destructive", title: "ログインに失敗しました", description: "もう一度お試しください。" });
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "ログインしました" });
      router.push("/");
    } catch (error) {
      console.error("Email sign-in error:", error);
      toast({ variant: "destructive", title: "ログインエラー", description: "メールアドレスかパスワードが間違っています。" });
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      const user = userCredential.user;
      
      // Initialize user-specific data upon sign up
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { email: user.email, createdAt: new Date() });

      toast({ title: "アカウントを作成しました", description: "ログインして始めましょう。" });
      // Redirect to home or automatically sign in
      router.push("/");
    } catch (error) {
      console.error("Email sign-up error:", error);
      toast({ variant: "destructive", title: "アカウント作成エラー", description: "このメールアドレスは既に使用されているか、パスワードが短すぎます。" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-4">
            <Image
                src="/images/login-rounded-right.png"
                width={100}
                height={100}
                alt="NurtureVerse Logo"
                className="rounded-full"
            />
        </div>
        <h1 className="text-4xl font-headline font-bold text-primary-foreground/90 text-center mb-2">NurtureVerse</h1>
        <p className="text-muted-foreground font-headline text-center mb-8">新しいおともだちが、あなたを待っています。</p>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">ログイン</TabsTrigger>
            <TabsTrigger value="signup">新規登録</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>ログイン</CardTitle>
                <CardDescription>アカウント情報を入力してください。</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">パスワード</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Button type="submit" className="w-full">メールアドレスでログイン</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>新規登録</CardTitle>
                <CardDescription>新しいアカウントを作成します。</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">メールアドレス</Label>
                    <Input id="new-email" type="email" placeholder="email@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">パスワード</Label>
                    <Input id="new-password" type="password" placeholder="6文字以上" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">登録する</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">または</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-67.7 67.7C314.6 114.5 283.5 104 248 104c-73.8 0-134.3 60.3-134.3 134s60.5 134 134.3 134c84.3 0 115.7-64.2 120.7-98.6H248v-85.3h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path></svg>
            Googleでログイン
        </Button>
      </div>
    </div>
  );
}
