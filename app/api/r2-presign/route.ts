import { S3Client } from "@aws-sdk/client-s3";

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    // Build time lo error raakunda empty client ivvadam
    // Runtime lo matrame actual check
    console.warn("R2 env missing at build time");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId || "dummy"}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId || "dummy",
      secretAccessKey: secretAccessKey || "dummy",
    },
  });
}

export const r2Client = getR2Client();
export const R2_BUCKET = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || "";
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || "";
