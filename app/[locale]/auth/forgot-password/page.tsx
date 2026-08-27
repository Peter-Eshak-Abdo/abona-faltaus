// app/[locale]/auth/forgot-password/page.tsx
"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import LogoHeader from "@/components/home/LogoHeader";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Mail, Loader2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { FaArrowRight } from "react-icons/fa";
import { useLocale } from "next-intl";
import { isRtlLocale } from "@/i18n/routing";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        const msg = resetError.message.toLowerCase();
        if (msg.includes("rate limit") || msg.includes("too many requests")) {
          setError("تم إرسال طلبات كثيرة، يرجى الانتظار دقيقة والمحاولة مجدداً.");
        } else if (msg.includes("invalid email")) {
          setError("صيغة البريد الإلكتروني غير صحيحة.");
        } else {
          setError(resetError.message || "حدث خطأ أثناء إرسال رابط الاستعادة.");
        }
      } else {
        setSent(true);
      }
    } catch {
      setError("حدث خطأ غير متوقع، يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-stone-800 dark:text-zinc-100 flex flex-col items-center" dir={isRtl ? "rtl" : "ltr"}>
      <LogoHeader />
      <div className="w-full max-w-md mx-auto my-0.25 px-0.5 mt-1 pt-5">
        <Card className="shadow-xl border-amber-900/10 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900">
          <CardHeader className="border-b border-stone-100 dark:border-zinc-800 pb-0.5">
            <CardTitle className="text-center flex flex-row items-center text-amber-900 dark:text-amber-500 font-bold text-lg">
              <div className="flex flex-row justify-between w-full items-center">
                <Link
                  href="/auth/signin"
                  className="p-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700 transition"
                  title="الرجوع لتسجيل الدخول"
                >
                  <FaArrowRight size={16} className={isRtl ? "" : "rotate-180"} />
                </Link>
                <p className="flex-1 text-center font-bold">استعادة كلمة المرور</p>
                <div className="w-8" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {sent ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-900 dark:text-zinc-100">تم إرسال الرابط بنجاح!</h3>
                  <p className="text-xs text-stone-600 dark:text-zinc-400">
                    أرسلنا رابط إعادة تعيين كلمة المرور إلى البريد الإلكتروني <span className="font-semibold text-amber-800 dark:text-amber-400">{email}</span>. يرجى فتح البريد واتباع التعليمات.
                  </p>
                </div>
                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { setSent(false); }}
                    className="w-full text-xs font-semibold rounded-xl"
                  >
                    إعادة الإرسال لبريد آخر
                  </Button>
                  <Link
                    href="/auth/signin"
                    className="text-xs text-amber-700 dark:text-amber-500 hover:underline font-bold inline-flex items-center justify-center gap-1"
                  >
                    العودة لصفحة تسجيل الدخول
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-stone-600 dark:text-zinc-400 text-center leading-relaxed">
                  أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لإعادة تعيين كلمة المرور الخاصة بك.
                </p>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-2.5 rounded-xl text-xs border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                    <span className="shrink-0 text-sm">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-stone-700 dark:text-zinc-300 font-semibold text-xs sm:text-sm">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="ps-9 bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 focus:border-amber-700 focus:ring-amber-700 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-bold py-2 h-10 text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                    disabled={loading || !email.trim()}
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loading ? "جاري إرسال الرابط..." : "إرسال رابط الاستعادة"}
                  </Button>
                </form>

                <div className="pt-2 text-center border-t border-stone-100 dark:border-zinc-800">
                  <Link
                    href="/auth/signin"
                    className="text-xs text-amber-700 dark:text-amber-500 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <span>تذكرت كلمة المرور؟ تسجيل الدخول</span>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
