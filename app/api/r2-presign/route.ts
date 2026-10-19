import { r2Client, R2_BUCKET } from "../../../lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_PUBLIC_URL = "https://pub-62904f82f9ea4d4ebf8da6283b4e5e65.r2.dev";

export async function POST(req: Request) {
  try {
    const { fileName, contentType, fileType } = await req.json();
    const finalFileName = fileName;
    const finalContentType = contentType || fileType || "application/octet-stream";
    
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: finalFileName,
      ContentType: finalContentType,
    });
    
    const url = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    const publicUrl = `${R2_PUBLIC_URL}/${finalFileName}`;
    
    return Response.json({ 
      url, 
      publicUrl, 
      key: finalFileName 
    });
  } catch (e) {
    console.error("R2 Presign Error:", e);
    return Response.json({ error: "Failed", details: String(e) }, { status: 500 });
  }
}
