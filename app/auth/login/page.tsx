"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  updateProfile,
} from "firebase/auth";
import { getFirebaseServices } from "@/lib/firebase"; // 수정됨
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ButtonGroup } from "@/components/ui/button-group";

export default function LoginPage() {
  const { auth, db } = getFirebaseServices(); // 수정됨
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (auth.currentUser) router.push("/");
  }, [router, auth.currentUser]);

  const saveUser = async (
    uid: string,
    displayName?: string | null
  ) => {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        uid,
        email,
        name: displayName || name || "مستخدم",
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleSocialLogin = async (
    provider: GoogleAuthProvider | GithubAuthProvider
  ) => {
    try {
      setIsLoading(true);
      const res = await signInWithPopup(auth, provider);
      await saveUser(res.user.uid, res.user.displayName);
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === "object" && err !== null && "code" in err) {
        const code = (err as { code: string }).code;
        if (code !== 'auth/popup-closed-by-user') {
          setError("حدث خطأ أثناء تسجيل الدخول الاجتماعي");
        }
      } else {
        setError("حدث خطأ أثناء تسجيل الدخول الاجتماعي");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setError("");
    if (!email || !password || (mode === "signup" && !name)) {
      setError("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("كلمة المرور قصيرة جدًا. يجب أن تكون 6 أحرف على الأقل.");
      return;
    }

    try {
      setIsLoading(true);
      if (mode === "login") {
        const res = await signInWithEmailAndPassword(auth, email.trim(), password);
        await saveUser(res.user.uid, res.user.displayName);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(res.user, { displayName: name });
        await saveUser(res.user.uid, name);
      }
      router.push("/");
    } catch (err: unknown) {
      console.error(err);
      if (typeof err === "object" && err !== null && "code" in err) {
        const code = (err as { code: string }).code;
        switch (code) {
          case "auth/user-not-found":
            setError("هذا المستخدم غير موجود. سجل أولاً.");
            break;
          case "auth/wrong-password":
            setError("كلمة المرور غير صحيحة.");
            break;
          case "auth/email-already-in-use":
            setError("هذا البريد مسجل بالفعل. سجل الدخول.");
            break;
          case "auth/invalid-email":
            setError("تنسيق البريد الإلكتروني غير صالح.");
            break;
          case "auth/weak-password":
            setError("كلمة المرور ضعيفة. 6 أحرف على الأقل.");
            break;
          default:
            setError(mode === "login" ? "فشل تسجيل الدخول. حاول مرة أخرى." : "فشل إنشاء الحساب. حاول مرة أخرى.");
        }
      } else {
        setError(mode === "login" ? "فشل تسجيل الدخول. حاول مرة أخرى." : "فشل إنشاء الحساب. حاول مرة أخرى.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex items-center justify-center min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="w-full max-w-xl bg-white shadow-lg">
          <CardHeader className="mb-1">
            <CardTitle className="text-center text-4xl font-extrabold">
              {mode === "login" ? "تسجيل الدخول" : "إنشاء حساب"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-1 gap-1">
              <Button
                variant={mode === "login" ? "default" : "outline"}
                onClick={() => setMode("login")}
                disabled={isLoading}
                className="mr-1"
                size="normal"
              >
                دخول
              </Button>
              <Button
                variant={mode === "signup" ? "default" : "outline"}
                onClick={() => setMode("signup")}
                disabled={isLoading}
                size="normal"
              >
                حساب جديد
              </Button>
            </div>

            {mode === "signup" && (
              <div className="mb-1">
                <Input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="mb-1">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                disabled={isLoading}
              />
            </div>

            <div className="mb-1">
              <Input
                type="password"
                placeholder="كلمة المرور"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <small className="text-gray-500">
                يجب أن تكون كلمة المرور 6 أحرف على الأقل.
              </small>
            </div>

            <Button
              className="w-full mb-1"
              onClick={handleEmailAuth}
              disabled={isLoading}
              size="normal"
            >
              {isLoading
                ? mode === "login"
                  ? "جاري الدخول..."
                  : "جاري الإنشاء..."
                : mode === "login"
                  ? "تسجيل الدخول"
                  : "إنشاء حساب"}
            </Button>

            <ButtonGroup aria-label="Button group" className="w-full gap-1 flex justify-center">
              <Button
                variant="destructive"
                onClick={() => handleSocialLogin(new GoogleAuthProvider())}
                disabled={isLoading}
                size="normal"
              >
                Google
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSocialLogin(new GithubAuthProvider())}
                disabled={isLoading}
                size="normal"
              >
                GitHub
              </Button>
            </ButtonGroup>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-1 rounded mt-1 text-center">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
