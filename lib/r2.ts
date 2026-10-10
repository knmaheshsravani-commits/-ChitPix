import { S3Client } from "@aws-sdk/client-s3";

// 100% Env nundi - No hardcoded - 100% Safe
export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const r2 = r2Client;
export const R2_BUCKET = process.env.R2_BUCKET!;
export const BUCKET = R2_BUCKET;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;
export const PUBLIC_URL = R2_PUBLIC_URL.replace(/\/$/, "");

export function getR2ImageUrl(key: string) {
  return `${PUBLIC_URL}/${key.replace(/^\//, "")}`;
}
export const getR2Url = getR2ImageUrl;
export const r2Url = getR2ImageUrl;
