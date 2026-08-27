import { Metadata } from 'next';
import LiturgiesClient from '@/components/liturgies/LiturgiesClient';

export const metadata: Metadata = {
  title: 'القداسات الإلهية التفاعلية (الخولاجي المقدس) — منصة أبونا فلتاؤس',
  description:
    'قارئ القداسات الإلهية التفاعلي (الباسيلي، الغريغوري، الكيرلسي، والقسم والتوزيع) بمردات الكاهن والشماس والشعب مع النصوص القبطية والمعربة والعربية وربط مباشر بالألحان والهزات.',
  keywords: [
    'القداس الباسيلي',
    'القداس الغريغوري',
    'القداس الكيرلسي',
    'خولاجي',
    'مردات الشماس',
    'مردات الكاهن',
    'مردات الشعب',
    'قبطي معرب',
    'هزات الألحان',
    'أبونا فلتاؤس',
  ],
};

export default function LiturgiesPage() {
  return <LiturgiesClient />;
}
