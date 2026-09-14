const routes = ["", "/work", "/start"];

export default function sitemap() {
  const baseUrl = "https://www.akhilshetty.com/";

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
