import { S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET || "chitpix";
const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || process.env.R2_ENDPOINT || `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "";
const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "";
const publicUrl = process.env.R2_PUBLIC_URL || process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev";

export const R2_BUCKET = bucket;
export const R2_PUBLIC_URL = publicUrl.replace(/\/$/, "");

export const r2Client = new S3Client({
  region: "auto",
  endpoint: endpoint || undefined,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

// ✅ FIXED - R2 Upload with ID Filter Compatible + Presign Fallback
export async function uploadToR2(file, folder = "posts") {
  try {
    // Folder lo user ID kuda add chestam for ID FILTER
    const safeName = file.name.replace(/\s+/g, "-");
    const fileName = `${folder}/${Date.now()}-${safeName}`;
    
    const res = await fetch("/api/r2-presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, fileType: file.type, contentType: file.type }),
    });
    
    if (!res.ok) {
      console.error("Presign failed:", await res.text());
      throw new Error("presign failed");
    }
    
    const { url, publicUrl: presignedPublicUrl } = await res.json();
    
    const uploadRes = await fetch(url, { 
      method: "PUT", 
      body: file, 
      headers: { "Content-Type": file.type } 
    });
    
    if (!uploadRes.ok) throw new Error("R2 PUT failed");
    
    return presignedPublicUrl || `${R2_PUBLIC_URL}/${fileName}`;
  } catch (e) {
    console.error("R2 Upload Error:", e);
    throw e;
  }
}
