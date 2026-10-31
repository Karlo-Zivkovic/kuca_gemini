import { ImageResponse } from "next/og";

// App icon: "VG" monogram on Adriatic blue, safe for Android's maskable crop.

export function generateStaticParams() {
  return [{ size: "192" }, { size: "512" }];
}

export async function GET(_req: Request, { params }: RouteContext<"/admin/icons/[size]">) {
  const { size } = await params;
  const px = size === "512" ? 512 : 192;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f4c5c",
          color: "#fffdf9",
        }}
      >
        <div style={{ fontSize: px * 0.36, fontWeight: 700, letterSpacing: px * -0.01, lineHeight: 1 }}>VG</div>
        <div style={{ width: px * 0.3, height: px * 0.025, background: "#e08a5f", marginTop: px * 0.05, borderRadius: px }} />
      </div>
    ),
    { width: px, height: px },
  );
}
