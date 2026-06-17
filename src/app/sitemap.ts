import { MetadataRoute } from "next"
import { TOOLS, APP_URL } from "@/lib/constants"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_URL

  // Static routes
  const routes = ["", "/tools", "/about", "/contact", "/privacy", "/terms", "/blog"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "weekly" as const,
    priority: route === "" ? (1.0 as const) : (0.8 as const),
  }))

  // Dynamic tool routes
  const toolRoutes = TOOLS.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "weekly" as const,
    priority: 0.9 as const,
  }))

  return [...routes, ...toolRoutes]
}
