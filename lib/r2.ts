import { S3Client } from "@aws-sdk/client-s3";

// Env nundi teesukuntadi - lekapothe nee hardcoded value vadutadi - 100% Safe
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "https://70ddfa247b43bececda6f27f36caf18a.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

// Rendu names export chestunna - Ye file lo em import chesina work avtadi!
export const r2 = r2Client;

export const R2_BUCKET = process.env.R2_BUCKET || "mahesh-yearly-2026";
export const BUCKET = R2_BUCKET;

export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "https://pub-fc1e591cb4b24dcab34c4a6c0d9f6a3.r2.dev";
export const PUBLIC_URL = R2_PUBLIC_URL.replace(/\/$/, "");

// 20k users kosam Full HD URL function
export function getR2ImageUrl(key: string) {
  return `${PUBLIC_URL}/${key.replace(/^\/+/, "")}`;
}
export const getR2Url = getR2ImageUrl;
export const r2Url = getR2ImageUrl;
