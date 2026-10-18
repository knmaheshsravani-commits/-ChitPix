import { r2Client, R2_BUCKET } from "../../../lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: Request) {
  try {
    const { fileName, fileType } = await req.json();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: fileName,
      ContentType: fileType,
    });
    const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    return Response.json({ url });
  } catch (e) {
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
