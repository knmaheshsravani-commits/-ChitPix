import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: "https://70ddfa247b43bececda6f27f36caf18a.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET = "mahesh-yearly-2026";
export const R2_PUBLIC_URL = "https://pub-fc1e591cb4b24dcab34c407f976e84d0.r2.dev";

// 20k users kosam upload function
export function getR2ImageUrl(key: string) {
  return `${R2_PUBLIC_URL}/${key}`;
}
