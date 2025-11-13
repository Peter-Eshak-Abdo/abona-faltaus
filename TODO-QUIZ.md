# TODO-QUIZ

## Current Tasks

- [ ] توحيد المؤقتات: جعل questionOnlyTimeLeft = 3 ثوانٍ في Host و Play و firebase-utils.ts
- [ ] تحسين Polling: استبدال polling في quiz-host-game.tsx بـ real-time listeners
- [ ] التعامل مع الإجابات المتأخرة: تحقق من showResults في submitResponse
- [ ] توحيد الألوان: جعل الألوان في Play نفسها في Host (أزرق، أصفر، أخضر، أحمر)
- [ ] تحسين الأمان: أضف تحقق لـ quizId و groupId
- [ ] إضافة Logging: أضف console.log في النقاط الحرجة
- [ ] استخدام useCallback: في Host و Play و quiz-host-game
- [ ] اختبار: اختبر مع عدة لاعبين للتأكد من التزامن

## Completed Tasks

- [x] مراجعة المنطق بين صفحة quiz/[quizId]/host و quiz/[quizId]/play و components/quiz/quiz-host-game
