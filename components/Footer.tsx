'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, PhoneCall, Mail, MessageCircle, User } from "lucide-react";

function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-4 py-8">
      {/* هذا القسم سيظهر فقط على الشاشات الكبيرة (md فما فوق) */}
      <div className="hidden md:block">
        <Link href="/" className="block text-foreground text-2xl font-bold mb-6 text-center hover:text-primary transition-colors">
          الصفحة الرئيسية
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-6 md:col-span-2">
            <h5 className="text-lg font-semibold mb-4">قسم الالحان والترانيم والعظات</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/al7an" className="text-muted-foreground hover:text-foreground transition-colors">
                  الحان
                </Link>
              </li>
              <li>
                <Link href="/tranim" className="text-muted-foreground hover:text-foreground transition-colors">
                  ترانيم
                </Link>
              </li>
              <li>
                <Link href="/3zat" className="text-muted-foreground hover:text-foreground transition-colors">
                  عظات
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <h5 className="text-lg font-semibold mb-4">الكتاب المقدس والمقالات الدينية</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/bible" className="text-muted-foreground hover:text-foreground transition-colors">
                  الكتاب المقدس
                </Link>
              </li>
              <li>
                <Link href="/mkalat" className="text-muted-foreground hover:text-foreground transition-colors">
                  المقالات
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-6 md:col-span-2">
            <h5 className="text-lg font-semibold mb-4">عرض فقرات</h5>
            <ul className="space-y-2">
              <li>
                <Link href="/exam" className="text-muted-foreground hover:text-foreground transition-colors">
                  الامتحانات
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-12 md:col-span-5 md:col-start-8">
            <form className="space-y-4">
              <h5 className="text-lg font-semibold">اشترك علشان يصلك كل جديد</h5>
              <p className="text-muted-foreground">
                ده طبعاً لسة مش بعرف اعملك ف سيبك من الحته ديه دلوقتي وشوف باقيتة
                الصفحة وخلاص
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="newsletter1"
                  type="email"
                  placeholder="Email address"
                  className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
                <Button type="button" disabled>
                  ماقلتلك ماتشتركش ياعم
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* هذا القسم سيظهر على جميع أحجام الشاشات */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 mt-6 border-t border-border">
        <a
          href="https://tofa7a-5e936.web.app/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <p>&copy; جميع الحقوق محفوظة لدي تفاحة طبعاً.</p>
        </a>
        <ul className="flex items-center gap-4 mt-4 sm:mt-0">
          <li>
            <a href="tel:01221331602" className="text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="h-6 w-6" />
            </a>
            <span className="mx-2 text-muted-foreground">||</span>
            <a href="tel:01202224608" className="text-muted-foreground hover:text-foreground transition-colors">
              <PhoneCall className="h-6 w-6" />
            </a>
          </li>
          <li>
            <a href="mailto:petereshak11gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-6 w-6" />
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/message/AOH44Q2TY3H2E1"
              title="Whatsapp"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-6 w-6 text-green-600" />
            </a>
          </li>
          <li>
            <a
              href="https://wa.me/qr/36KBTEORX2N3O1"
              title="Whatsapp"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-6 w-6 text-green-700" />
            </a>
          </li>
          <li>
            <a
              href="https://tofa7a-5e936.web.app/"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <User className="h-6 w-6" />
              عن المطور
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
