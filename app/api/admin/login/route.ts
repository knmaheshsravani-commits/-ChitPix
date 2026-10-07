import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    
    // Nee admin password ikkada pettu
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChitPix@2026!'

    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
