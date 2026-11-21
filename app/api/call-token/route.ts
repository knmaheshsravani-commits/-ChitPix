import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const LIVEKIT_URL = process.env.LIVEKIT_URL;
    const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY;
    const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET;

    if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
      return NextResponse.json(
        { error: "LiveKit environment variables missing" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const username = String(body.username || "").trim();
    const roomName = String(body.roomName || "").trim();

    if (!username || !roomName) {
      return NextResponse.json(
        { error: "username and roomName are required" },
        { status: 400 }
      );
    }

    const token = new AccessToken(
      LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET,
      {
        identity: username,
        ttl: "1h",
      }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      token: jwt,
      serverUrl: LIVEKIT_URL,
      roomName,
    });
  } catch (error) {
    console.error("LiveKit token error:", error);

    return NextResponse.json(
      { error: "Unable to create call token" },
      { status: 500 }
    );
  }
}
