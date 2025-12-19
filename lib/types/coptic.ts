// lib/types/coptic.ts

export interface CopticTitle {
  english?: string;
  coptic?: string;
  arabic?: string;
}

export interface Verse {
  english?: string;
  arabic?: string;
  coptic?: string;
  coptic_english?: string; // النطق القبطي المعرب/المأنجلش
  coptic_arabic?: string;
}

export interface Section {
  speaker?: string;
  type?: string;
  verses: Verse[];
}

// الواجهة الرئيسية لملف الصلاة/الذكصولوجية
export interface PrayerDocument {
  title: CopticTitle | string; // قد يكون نصاً في بعض الملفات وكائناً في أخرى
  type: string;
  sections?: Section[];
  // حقول أخرى قد تكون موجودة في أنواع أخرى مثل القطمارس
  coptic_date?: any;
  readings?: any;
}
