import { Meta } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";

export function SocialMeta() {
  const location = useLocation();

  const getOgImageUrl = () => {
    const baseUrl = process.env.VITE_VERCEL_URL
      ? process.env.VITE_VERCEL_URL
      : process.env.NODE_ENV === "production"
        ? "https://solvemaze.vercel.app"
        : "http://localhost:3000";

    const url = new URL("/api/preview", baseUrl);
    const searchParams = new URLSearchParams(location.search);

    if (searchParams.has("grid")) {
      url.searchParams.set("grid", searchParams.get("grid")!);
    }
    if (searchParams.has("boardSizeType")) {
      url.searchParams.set("boardSizeType", searchParams.get("boardSizeType")!);
    }

    return url.toString();
  };

  return (
    <>
      <Meta property="og:title" content="Pathfinding Visualizer" />
      <Meta
        property="og:description"
        content="Interactive visualization of pathfinding algorithms"
      />
      <Meta property="og:type" content="website" />
      <Meta property="og:image" content={getOgImageUrl()} />
      <Meta property="og:image:width" content="1200" />
      <Meta property="og:image:height" content="630" />

      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content="Pathfinding Visualizer" />
      <Meta
        name="twitter:description"
        content="Interactive visualization of pathfinding algorithms"
      />
      <Meta name="twitter:image" content={getOgImageUrl()} />
    </>
  );
}
