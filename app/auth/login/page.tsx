"use client";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // الدخول بجوجل
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  // إنشاء حساب أو دخول بالبريد
  const handleAuth = async (mode: 'login' | 'signup') => {
    const { error } = mode === 'signup'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else router.push("/");
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
              تسجيل الدخول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-1 gap-1">
              <Button
                onClick={() => handleAuth("login")}
                className="mr-1"
                size="normal"
              >
                دخول
              </Button>
              <Button
                variant="default"
                onClick={() => handleAuth("signup")}
                size="normal"
              >
                حساب جديد
              </Button>
            </div>

            {/* {mode === "signup" && (
              <div className="mb-1">
                <Input
                  type="text"
                  placeholder="الاسم الكامل"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )} */}

            <div className="mb-1">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
              />
            </div>

            <div className="mb-1">
              <Input
                type="password"
                placeholder="كلمة المرور"
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <small className="text-gray-500">
                يجب أن تكون كلمة المرور 6 أحرف على الأقل.
              </small>
            </div>

            <Button
              className="w-full mb-1"
              onClick={handleGoogleLogin}
              size="normal"
            >
                جاري الدخول...
            </Button>

            <ButtonGroup aria-label="Button group" className="w-full gap-1 flex justify-center">
              <Button
                variant="destructive"
                onClick={() => handleGoogleLogin()}
                size="normal"
              >
                Google
              </Button>
              <Button
              variant="secondary"
                onClick={() => handleAuth('login')}
                size="normal"
              >
                GitHub
              </Button>
            </ButtonGroup>

            {/* {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-1 rounded mt-1 text-center">
                {error}
              </div>
            )}*/}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
