/**
 * Offline Quiz Store
 * يخزن المسابقات محلياً في IndexedDB عبر localforage
 * ويعمل على sync تلقائي عند عودة الاتصال بالإنترنت
 */

import localforage from "localforage";
import type { Quiz } from "@/types/quiz";

const PENDING_QUIZZES_KEY = "pending_quizzes_upload";
const OFFLINE_QUIZZES_KEY = "offline_quizzes_list";

export interface PendingQuiz {
  localId: string;
  quiz: Omit<Quiz, "id">;
  createdAt: string;
  userId: string;
}

/** حفظ مسابقة جديدة محلياً للرفع لاحقاً */
export async function savePendingQuiz(
  quiz: Omit<Quiz, "id">,
  userId: string
): Promise<string> {
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const pending = await getPendingQuizzes();
  const newPending: PendingQuiz = {
    localId,
    quiz,
    createdAt: new Date().toISOString(),
    userId,
  };
  pending.push(newPending);
  await localforage.setItem(PENDING_QUIZZES_KEY, pending);

  // نضيفها برضو للقائمة المحلية للعرض الفوري
  await addToLocalList({ ...quiz, id: localId, _isPending: true } as any);

  return localId;
}

/** جلب كل المسابقات المعلقة */
export async function getPendingQuizzes(): Promise<PendingQuiz[]> {
  return (await localforage.getItem<PendingQuiz[]>(PENDING_QUIZZES_KEY)) || [];
}

/** حذف مسابقة معلقة بعد رفعها بنجاح */
export async function removePendingQuiz(localId: string): Promise<void> {
  const pending = await getPendingQuizzes();
  const filtered = pending.filter((p) => p.localId !== localId);
  await localforage.setItem(PENDING_QUIZZES_KEY, filtered);
  await removeFromLocalList(localId);
}

/** إضافة مسابقة لقائمة الكاش المحلي */
export async function addToLocalList(quiz: any): Promise<void> {
  const list = await getLocalQuizList();
  const existing = list.findIndex((q: any) => q.id === quiz.id);
  if (existing >= 0) {
    list[existing] = quiz;
  } else {
    list.unshift(quiz);
  }
  await localforage.setItem(OFFLINE_QUIZZES_KEY, list);
}

/** حذف مسابقة من الكاش المحلي */
export async function removeFromLocalList(id: string): Promise<void> {
  const list = await getLocalQuizList();
  await localforage.setItem(
    OFFLINE_QUIZZES_KEY,
    list.filter((q: any) => q.id !== id)
  );
}

/** جلب قائمة المسابقات من الكاش */
export async function getLocalQuizList(): Promise<any[]> {
  return (await localforage.getItem<any[]>(OFFLINE_QUIZZES_KEY)) || [];
}

/** حفظ قائمة المسابقات من السيرفر في الكاش */
export async function cacheQuizList(quizzes: any[]): Promise<void> {
  // نحتفظ بالمسابقات المعلقة غير المرفوعة
  const pending = await getPendingQuizzes();
  const pendingIds = new Set(pending.map((p) => p.localId));
  const localOnly = (await getLocalQuizList()).filter((q: any) =>
    pendingIds.has(q.id)
  );
  await localforage.setItem(OFFLINE_QUIZZES_KEY, [...localOnly, ...quizzes]);
}

/** رفع كل المسابقات المعلقة عند عودة الإنترنت */
export async function syncPendingQuizzes(
  uploadFn: (quiz: Omit<Quiz, "id" | "createdAt">) => Promise<any>
): Promise<{ synced: number; failed: number }> {
  const pending = await getPendingQuizzes();
  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await uploadFn(item.quiz as Omit<Quiz, "id" | "createdAt">);
      await removePendingQuiz(item.localId);
      synced++;
    } catch (err) {
      console.error("Failed to sync quiz:", item.localId, err);
      failed++;
    }
  }

  return { synced, failed };
}
