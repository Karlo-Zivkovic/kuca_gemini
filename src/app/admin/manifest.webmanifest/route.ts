// PWA manifest for the admin app ("Add to home screen" on Android).

export function GET() {
  return Response.json(
    {
      name: "Villa Gemini kalendar",
      short_name: "Gemini",
      description: "Upravljanje zauzetošću i cijenama za Villa Gemini",
      id: "/admin",
      start_url: "/admin",
      scope: "/admin",
      display: "standalone",
      orientation: "portrait",
      background_color: "#f6f1e9",
      theme_color: "#0f4c5c",
      lang: "hr",
      icons: [
        { src: "/admin/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/admin/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/admin/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } },
  );
}
