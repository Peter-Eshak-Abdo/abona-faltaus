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
  coptic_english?: string;
}

export interface Reading {
  title?: string;
  introduction?: string; // مقدمة القراءة (مثل: من رسالة معلمنا بولس...)
  text?: string | Verse[]; // النص قد يكون نصاً عادياً أو مصفوفة آيات
  ref?: string; // الشاهد (مثل: رومية 1: 1-5)
}

export interface Section {
  title?: string;
  speaker?: string; // الكاهن، الشماس، الشعب
  type?: string;
  verses?: Verse[]; // اجعلناها اختيارية ؟
}

export interface PrayerDocument {
  type?: string; // reading, prayer, etc.
  title: CopticTitle | string;
  sections?: Section[];
  readings?: Reading[]; // إضافة دعم للقراءات المباشرة
}
