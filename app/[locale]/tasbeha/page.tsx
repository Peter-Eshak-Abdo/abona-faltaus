import { Metadata } from 'next';
import TasbehaClient from '@/components/tasbeha/TasbehaClient';

export const metadata: Metadata = {
  title: 'تسبحة نصف الليل والعشية وباكر وكيهك (الإبصالمودية المقدسة) — منصة أبونا فلتاؤس',
  description:
    'كتاب التسبحة التفاعلي الشامل (تسبحة نصف الليل، تسبحة العشية، تسبحة باكر، وتسبحة كيهك) بنصوص قبطية ومعربة وعربية ونغمات آدام وواطس وربط مباشر بالألحان والهزات الموسيقية.',
  keywords: [
    'تسبحة نصف الليل',
    'تسبحة كيهك',
    'الهوس الأول',
    'الهوس الثاني',
    'الهوس الثالث',
    'الهوس الرابع',
    'إبصالمودية',
    'ثيؤطوكيات',
    'مدائح',
    'قبطي معرب',
    'أبونا فلتاؤس',
  ],
};

export default function TasbehaPage() {
  return <TasbehaClient />;
}
