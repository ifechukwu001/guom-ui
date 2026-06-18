export default defineNuxtConfig({
  compatibilityDate: "2026-06-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@nuxtjs/mdc"],
  css: ["~/assets/css/main.css"],
  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],
  fonts: {
    provider: "local",
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "http://localhost:8000",
    },
  },
  app: {
    head: {
      title: "Guom AI",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Guom AI frontend built with Nuxt 4 and Nuxt UI.",
        },
      ],
    },
  },
});
