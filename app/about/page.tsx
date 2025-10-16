"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Church, Users, BookOpen, Music, GraduationCap, Heart, Mail, Github, ExternalLink } from "lucide-react";
import { APP_VERSION } from "@/lib/version";

export default function AboutPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-1">
      <div className="w-full max-w-4xl space-y-1 backdrop-blur-md bg-white/10 dark:bg-black/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center">
              <Church className="w-12 h-12 text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-black drop-shadow-lg">أبونا فلتاؤس السرياني</h1>
          <p className="text-xl text-black/90 drop-shadow-md">تطبيق تفاحة - كنيسة السيدة العذراء مريم بالاسماعيلية</p>
          <Badge variant="secondary" className="text-sm bg-white/30 text-black border-white/40 mt-1">
            نسخة تجريبية {APP_VERSION}
          </Badge>
        </div>

        {/* Mission */}
        <Card className="backdrop-blur-md bg-white/20 dark:bg-black/20 shadow-xl/30 inset-shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black drop-shadow-md">
              <Heart className="w-5 h-5 text-red-500" />
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
            <CardTitle className="flex items-center text-black drop-shadow-md">
              <BookOpen className="w-5 h-5" />
              المميزات الرئيسية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-blue-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black">الحان والترانيم</h3>
                    <p className="text-sm text-black/80">
                      مجموعة شاملة من الحان الكنسية والترانيم المقدسة
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-green-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black">الكتاب المقدس</h3>
                    <p className="text-sm text-black/80">
                      قراءة الكتاب المقدس باللغتين العربية والإنجليزية
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-purple-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black">الامتحانات والاختبارات</h3>
                    <p className="text-sm text-black/80">
                      امتحانات فردية وجماعية لتعزيز المعرفة الدينية
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black">المقالات والمحتوى</h3>
                    <p className="text-sm text-black/80">
                      مقالات دينية ومحتوى تعليمي متنوع
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Church className="w-5 h-5 text-red-500 mt-1" />
                  <div>
                    <h3 className="font-semibold text-black">الخدمات الكنسية</h3>
                    <p className="text-sm text-black/80">
                      معلومات عن الخدمات والأجبية والصلوات
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-pink-500 mt-1" />
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
            <CardTitle className="flex items-center gap-2 text-black drop-shadow-md">
              <Church className="w-5 h-5" />
              معلومات الكنيسة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-black">كنيسة السيدة العذراء مريم بالاسماعيلية</h3>
                <p className="text-sm text-black/80 mb-4">
                  كنيسة أرثوذكسية قبطية
                </p>
                <div className="space-y-2">
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
            <CardTitle className="flex items-center gap-2 text-black drop-shadow-md">
              <Users className="w-5 h-5" />
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
              <div className="flex justify-center  flex-col md:flex-row gap-4">
                <Button variant="outline" size="sm" className="bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold" asChild>
                  <a href="mailto:petereshak11@gmail.com" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    البريد الإلكتروني
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold" asChild>
                  <a href="https://github.com/Peter-Eshak-Abdo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="bg-white/30 hover:bg-white/40 border-white/40 text-black font-semibold" asChild>
                  <a href="https://tofa7a-5e936.web.app/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    عرض البورتفوليو
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-3 pb-2">
          <p className="text-black/80">
            © {currentYear} أبونا فلتاؤس السرياني تفاحة - جميع الحقوق محفوظة
          </p>
          <div className="flex justify-center gap-4 text-sm text-black/80">
            <a href="#" className="hover:text-black transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-black transition-colors">الشروط والأحكام</a>
            <a href="#" className="hover:text-black transition-colors">اتصل بنا</a>
          </div>
        </div>
      </div>
    </div>
  );
}
