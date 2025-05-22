/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: "https://abona-faltaus.vercel.app",
  generateRobotsTxt: true, // (optional)
  generateIndexSitemap: false,
  sitemapSize: 7000,
  changefreq: "daily",
  priority: 0.7,
  exclude: ["/admin/*", "/api/*", "/private/*"],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/*", "/admin/*", "/private/*"],
      },
    ],
  },
};
