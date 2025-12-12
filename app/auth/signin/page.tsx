"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { getFirebaseServices } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import LogoHeader from "@/components/LogoHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const { auth } = getFirebaseServices();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/auth/profile");
    } catch {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/profile");
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === "object" && err !== null && "code" in err) {
        const code = (err as { code: string }).code;
        if (code !== 'auth/popup-closed-by-user') {
          setError("فشل تسجيل الدخول باستخدام Google");
        }
      } else {
        setError("فشل تسجيل الدخول باستخدام Google");
      }
    }
  };

  const handlePhoneSignIn = async () => {
    const phoneNumber = prompt("ادخل رقم هاتفك (مثال: +201234567890)");
    if (!phoneNumber) return;

    try {
      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier
      );

      const code = prompt("ادخل كود التحقق المرسل إليك");
      if (code) {
        await confirmation.confirm(code);
        router.push("/auth/profile");
      }
    } catch {
      setError("فشل تسجيل الدخول برقم الهاتف");
    }
  };

  return (
    <>
      <LogoHeader />
      <div className="max-w-7xl mx-auto my-1">
        <Card className="max-w-md mx-auto bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-1 rounded mb-1">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailSignIn} className="space-y-1">
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                دخول بالبريد الإلكتروني
              </Button>
            </form>

            <div className="text-center my-1">
              <span>أو</span>
            </div>

            <div className="grid gap-1">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                الدخول باستخدام Google
              </Button>

              <Button
                variant="outline"
                onClick={handlePhoneSignIn}
                className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
              >
                الدخول برقم الهاتف
              </Button>
            </div>

            <div id="recaptcha-container"></div>

            <p className="mt-1 text-center">
              ليس لديك حساب؟{" "}
              <Link href="/auth/signup" className="underline">
                أنشئ حساب جديد
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
