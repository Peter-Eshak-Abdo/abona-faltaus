import { useQuery } from "@tanstack/react-query";
import { getUserQuizzes } from "@/lib/firebase-utils";
import type { Quiz } from "@/types/quiz";

export function useQuizzes(userId: string | undefined) {
  return useQuery({
    queryKey: ["quizzes", userId],
    queryFn: async (): Promise<Quiz[]> => {
      if (!userId) return [];
      return await getUserQuizzes(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
