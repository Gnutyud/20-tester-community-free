import { MetadataRoute } from "next";

const domain = process.env.NEXT_PUBLIC_APP_URL || "https://20-tester-community-free.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: domain,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${domain}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
