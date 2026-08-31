"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, BookOpen, Clock, Tag, PlusCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  author_id: string | null;
}

export default function ArticlesClient() {
  const t = useTranslations('Articles');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("faith");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const categories = [
    { key: "all", label: t('categories.all') },
    { key: "faith", label: t('categories.faith') },
    { key: "rites", label: t('categories.rites') },
    { key: "history", label: t('categories.history') },
    { key: "meditations", label: t('categories.meditations') },
    { key: "general", label: t('categories.general') },
  ];

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        setArticles(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      toast.error(t('fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();

    // التحقق من تسجيل دخول المستخدم
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLike = async (articleId: string) => {
    if (!user) {
      toast.error(t('loginRequiredLike'));
      return;
    }

    try {
      // Optimistic update
      const isCurrentlyLiked = likedArticles.has(articleId);
      const newLikedSet = new Set(likedArticles);
      if (isCurrentlyLiked) {
        newLikedSet.delete(articleId);
      } else {
        newLikedSet.add(articleId);
      }
      setLikedArticles(newLikedSet);

      setArticles((prev) =>
        prev.map((art) => {
          if (art.id === articleId) {
            return {
              ...art,
              likes_count: isCurrentlyLiked
                ? Math.max(0, art.likes_count - 1)
                : art.likes_count + 1,
            };
          }
          return art;
        })
      );

      const res = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to like");
      }
    } catch (err) {
      console.error(err);
      toast.error(t('publishError'));
      fetchArticles(); // Rollback
    }
  };

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(t('loginRequiredWrite'));
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error(t('emptyFields'));
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });

      if (res.ok) {
        toast.success(t('publishSuccess'));
        setTitle("");
        setContent("");
        setShowAddModal(false);
        fetchArticles();
      } else {
        const errData = await res.json();
        toast.error(errData.error || t('publishError'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('publishError'));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredArticles =
    selectedCategory === "all"
      ? articles
      : articles.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-0.5">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-0.5 bg-card/60 backdrop-blur-md p-0.5 rounded-2xl border shadow-sm">
        {/* Category Badges */}
        <div className="flex flex-wrap items-center gap-0.25">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`px-0.5 py-0.25 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedCategory === cat.key
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 scale-105"
                  : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Add Article Button */}
        <button
          onClick={() => {
            if (!user) {
              toast.error(t('loginRequiredWrite'));
              return;
            }
            setShowAddModal(true);
          }}
          className="flex items-center gap-0.25 px-0.5 py-0.25 rounded-xl bg-linear-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold shadow-md shadow-amber-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm whitespace-nowrap"
        >
          <PlusCircle className="w-3 h-3" />
          <span>{t('writeNew')}</span>
        </button>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-muted/40 animate-pulse border"
            />
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-2 bg-card/40 rounded-3xl border border-dashed p-0.5">
          <BookOpen className="w-4 h-4 mx-auto text-muted-foreground/50 mb-0.25" />
          <h3 className="text-xl font-bold text-foreground mb-0.25">
            {t('noArticles')}
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-1">
            {t('noArticlesHint')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="bg-card hover:bg-card/90 rounded-2xl p-0.5 border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-0.25">
                  <span className="flex items-center gap-0.25 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-0.5 py-0.25 rounded-full">
                    <Tag className="w-3 h-3" />
                    {article.category || t('categories.general')}
                  </span>
                  <span className="flex items-center gap-0.5 font-medium">
                    <Clock className="w-3 h-3" />
                    {new Date(article.created_at).toLocaleDateString("ar-EG", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-foreground mb-0.5 group-hover:text-amber-600 transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4 whitespace-pre-line mb-0.25 font-normal">
                  {article.content}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-0.5 border-t border-border/50 text-sm">
                <button
                  onClick={() => handleLike(article.id)}
                  className={`flex items-center gap-0.25 px-0.5 py-0.25 rounded-lg transition-colors font-medium text-xs ${
                    likedArticles.has(article.id)
                      ? "text-red-500 bg-red-50 dark:bg-red-950/30"
                      : "text-muted-foreground hover:text-red-500 hover:bg-muted"
                  }`}
                >
                  <Heart
                    className={`w-3 h-3 ${
                      likedArticles.has(article.id)
                        ? "fill-red-500 text-red-500"
                        : ""
                    }`}
                  />
                  <span>{article.likes_count || 0}</span>
                </button>

                <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span>{t('spiritualMeditation')}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Add Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0.5">
          <div className="bg-card w-full max-w-xl rounded-3xl border shadow-2xl p-0.5 md:p-1 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-0.5 pb-0.5 border-b">
              <h3 className="text-2xl font-bold text-foreground">
                {t('writeNewModal')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-lg px-0.25 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-0.5">
              <div>
                <label className="block text-sm font-semibold mb-0.25 text-foreground">
                  {t('articleTitle')}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-0.5 py-0.25 rounded-xl border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-0.25 text-foreground">
                  {t('category')}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-0.5 py-0.25 rounded-xl border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 text-sm"
                >
                  {categories
                    .filter((c) => c.key !== "all")
                    .map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-0.25 text-foreground">
                  {t('articleContent')}
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder={t('contentPlaceholder')}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-0.5 py-0.25 rounded-xl border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 text-sm leading-relaxed resize-y"
                />
              </div>

              <div className="flex items-center justify-end gap-0.5 pt-0.5 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-0.5 py-0.25 rounded-xl text-muted-foreground hover:bg-muted text-sm font-semibold transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-0.25 px-1 py-0.25 rounded-xl bg-linear-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold shadow-md shadow-amber-600/25 transition disabled:opacity-50 text-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>{submitting ? t('publishing') : t('publish')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
