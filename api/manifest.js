export default async function handler(req, res) {
  // Allow all origins & set manifest headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/manifest+json; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || "impact-resell";

  // Determine hostname
  const host = (
    req.headers["x-forwarded-host"] ||
    req.headers.host ||
    ""
  ).toLowerCase();

  let lookupKey = null;
  const parts = host.split(".");
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    if (parts.length > 1 && parts[0] !== "www") {
      lookupKey = parts[0];
    }
  } else if (
    host === "i-cpp.com" ||
    host === "www.i-cpp.com" ||
    host === "impact-resell.vercel.app"
  ) {
    lookupKey = null;
  } else if (parts.length >= 3 && host.endsWith("i-cpp.com")) {
    if (parts[0] !== "www") {
      lookupKey = parts[0];
    }
  } else {
    // Custom domain (e.g. gyanjyoti.com)
    lookupKey = host.replace(/^www\./, "");
  }

  let academyName = "AI Courses";
  let academyLogo = "/vite.svg";
  let themeColor = "#0f172a";
  let tagline = "Explore and master top AI tools and skills with premium online AI courses.";

  if (lookupKey) {
    try {
      // Step 1: Lookup subdomain document in Firestore REST API
      const subUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/subdomains/${encodeURIComponent(lookupKey)}`;
      const subRes = await fetch(subUrl);

      let ownerId = null;

      if (subRes.ok) {
        const subDoc = await subRes.json();
        ownerId = subDoc.fields?.ownerId?.stringValue;
      }

      // Step 2: Fetch agency document using ownerId
      if (ownerId) {
        const agencyUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/agencies/${encodeURIComponent(ownerId)}`;
        const agencyRes = await fetch(agencyUrl);

        if (agencyRes.ok) {
          const agencyDoc = await agencyRes.json();
          const fields = agencyDoc.fields || {};

          if (fields.name?.stringValue) {
            academyName = fields.name.stringValue;
          }
          if (fields.logo?.stringValue) {
            academyLogo = fields.logo.stringValue;
          } else if (fields.logoUrl?.stringValue) {
            academyLogo = fields.logoUrl.stringValue;
          }
          if (fields.themeColor?.stringValue) {
            themeColor = fields.themeColor.stringValue;
          }
          if (fields.tagline?.stringValue) {
            tagline = fields.tagline.stringValue;
          } else {
            tagline = `Learn & grow with ${academyName}`;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching partner agency manifest info:", error);
    }
  }

  const shortName =
    academyName.length > 15 ? academyName.substring(0, 15) : academyName;

  // Build high-compatibility Web App Manifest
  const manifest = {
    name: academyName,
    short_name: shortName,
    description: tagline,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: themeColor,
    orientation: "portrait-primary",
    icons: [
      {
        src: academyLogo,
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: academyLogo,
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };

  return res.status(200).json(manifest);
}
