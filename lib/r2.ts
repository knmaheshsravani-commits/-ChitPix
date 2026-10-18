import { S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.R2_BUCKET_NAME || process.env.CLOUDFLARE_R2_BUCKET || process.env.CLOUDFLARE_R2_BUCKET_NAME || "chitpix";

const endpoint = process.env.CLOUDFLARE_R2_ENDPOINT || process.env.R2_ENDPOINT || "";

const accessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "";

const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "";

export const R2_BUCKET = bucket;

export const r2Client = new S3Client({
  region: "auto",
  endpoint: endpoint || undefined,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});
