export const toMillis = (t?: any): number | undefined => {
  if (!t) return undefined;
  if (typeof t === "number") return t;
  // Firestore Timestamp
  if (t?.toDate && typeof t.toDate === "function") {
    const d = t.toDate();
    return isNaN(d.getTime()) ? undefined : d.getTime();
  }
  // Date or parseable string
  const d = new Date(t);
  return isNaN(d.getTime()) ? undefined : d.getTime();
};

export const safeCeil = (n?: number) => {
  if (n === undefined || !isFinite(n)) return 0;
  return Math.ceil(n);
};
