"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Church, Users, BookOpen, Music, GraduationCap, Heart, Mail, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { APP_VERSION } from "@/lib/version";
import router from "next/router";
import { FaArrowRight } from "react-icons/fa";

const gmail = process.env.NEXT_PUBLIC_GMAIL;
const github = process.env.NEXT_PUBLIC_GITHUB;
const portfolio = process.env.NEXT_PUBLIC_PORTFOLIO;

export default function AboutPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-linear-to-br flex items-center justify-center p-4">
      <div className="w-full max-w-8xl space-y-4 backdrop-blur-md bg-white/10 dark:bg-black/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="p-2 m-2 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-zinc-300 transition self-baseline">
            <FaArrowRight size={18} />
          </Link>
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center">
              <Church className="w-12 h-12 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-black drop-shadow-lg">أبونا فلتاؤس السرياني</h1>
          <p className="text-xl text-black/90 drop-shadow-md">تطبيق تفاحة - كنيسة السيدة العذراء مريم بالاسماعيلية</p>
          <Badge variant="secondary" className="text-sm bg-white/30 text-black border-white/40 mt-4">
            نسخة تجريبية {APP_VERSION}
          </Badge>
        </div>

        {/* Mission */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-black drop-shadow-md">
              <Heart className="w-6 h-6 text-red-500" />
              رسالتنا
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed text-black/90">
              نسعى لنشر الإيمان الأرثوذكسي وتعزيز الروحانية المسيحية من خلال توفير محتوى ديني شامل
              يشمل الحان الكنسية، الترانيم، الكتاب المقدس، والمحتوى التعليمي لخدمة أبناء الكنيسة القبطية الأرثوذكسية.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-black drop-shadow-md">
              <BookOpen className="w-6 h-6" />
              المميزات الرئيسية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Music className="w-8 h-8 text-blue-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black">الحان والترانيم</h3>
                    <p className="text-sm text-black/80">
                      مجموعة شاملة من الحان الكنسية والترانيم المقدسة
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <BookOpen className="w-8 h-8 text-green-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black">الكتاب المقدس</h3>
                    <p className="text-sm text-black/80">
                      قراءة الكتاب المقدس باللغتين العربية والإنجليزية
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <GraduationCap className="w-8 h-8 text-purple-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black">الامتحانات والاختبارات</h3>
                    <p className="text-sm text-black/80">
                      امتحانات فردية وجماعية لتعزيز المعرفة الدينية
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Users className="w-8 h-8 text-orange-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black">المقالات والمحتوى</h3>
                    <p className="text-sm text-black/80">
                      مقالات دينية ومحتوى تعليمي متنوع
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Church className="w-8 h-8 text-red-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black">الخدمات الكنسية</h3>
                    <p className="text-sm text-black/80">
                      معلومات عن الخدمات والأجبية والصلوات
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Heart className="w-8 h-8 text-pink-500 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-black">الإشعارات اليومية</h3>
                    <p className="text-sm text-black/80">
                      آيات يومية وأقوال من الآباء القديسين
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Church Info */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-black drop-shadow-md">
              <Church className="w-6 h-6" />
              معلومات الكنيسة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-4 text-black">كنيسة السيدة العذراء مريم بالاسماعيلية</h3>
                <p className="text-sm text-black/80 mb-4">
                  كنيسة أرثوذكسية قبطية
                </p>
                <div className="space-y-4">
                  <p className="text-black"><strong>الموقع:</strong> مصر</p>
                  <p className="text-black"><strong>التابعية:</strong> الكنيسة القبطية الأرثوذكسية</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer Info */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-black drop-shadow-md">
              <Users className="w-20 h-20" />
              فريق التطوير
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <h3 className="font-bold text-2xl text-black">ابونا فلتاؤس السرياني</h3>
                <p className="text-black/80">بشفاعته</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-black">Peter Eshak Abdo</h3>
                <p className="text-black/80">مطور التطبيق</p>
              </div>
              <div className="flex justify-center flex-col md:flex-row gap-4">
                <Button variant="outline" size="normal" className="bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold" asChild>
                  <a href={`mailto:${gmail}`} className="flex items-center gap-4">
                    <Mail className="w-16 h-16" />
                    البريد الإلكتروني
                  </a>
                </Button>
                <Button variant="outline" size="normal" className="bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold" asChild>
                  <a href={github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                    <ExternalLink className="w-16 h-16" />
                    {/* <Github className="w-16 h-16" /> */}
                    GitHub
                    <ExternalLink className="w-12 h-12" />
                  </a>
                </Button>
                <Button variant="outline" size="normal" className="bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold" asChild>
                  <a href={portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
                    <ExternalLink className="w-16 h-16" />
                    عرض البورتفوليو
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8 pb-4">
          <p className="text-black/80">
            © {currentYear} أبونا فلتاؤس السرياني تفاحة - جميع الحقوق محفوظة
          </p>
          <div className="flex justify-center gap-4 text-sm text-black/80">
            <Button onClick={() => router.push(`/privacy`)} className="hover:text-black transition-colors">سياسة الخصوصية</Button>
            <Button onClick={() => router.push(`/terms`)} className="hover:text-black transition-colors">الشروط والأحكام</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
