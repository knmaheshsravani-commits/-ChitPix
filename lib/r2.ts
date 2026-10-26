import { S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.R2_BUCKET_NAME || "chitpix";
const accountId = process.env.R2_ACCOUNT_ID || process.env.CLOUDFLARE_R2_ACCOUNT_ID || "";
const endpoint = process.env.R2_ENDPOINT || `https://${accountId}.r2.cloudflarestorage.com`;
const accessKey = process.env.R2_ACCESS_KEY_ID || "";
const secretKey = process.env.R2_SECRET_ACCESS_KEY || "";

// YOUR FIXED PUBLIC URL
const publicUrlRaw = process.env.R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev";

export const R2_BUCKET = bucket;
export const R2_PUBLIC_URL = publicUrlRaw.replace(/\/$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

// NEW - Idhe nee app motham vaadali
export function getR2Url(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${R2_PUBLIC_URL}${clean}`;
}

// FIXED UPLOAD - ID Filter Compatible
export async function uploadToR2(file: File, folder = "posts") {
  try {
    const safeName = file.name.replace(/\s+/g, "-");
    const fileName = `${folder}/${Date.now()}-${safeName}`;
    
    const res = await fetch("/api/r2-presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileType: file.type }),
    });
    
    if (!res.ok) throw new Error("presign failed: " + await res.text());
    
    const { url, publicUrl } = await res.json();
    
    const uploadRes = await fetch(url, { 
      method: "PUT", 
      body: file, 
      headers: { "Content-Type": file.type } 
    });
    
    if (!uploadRes.ok) throw new Error("R2 PUT failed");
    
    return publicUrl || getR2Url(fileName);
  } catch (e) {
    console.error("R2 Upload Error:", e);
    throw e;
  }
}
