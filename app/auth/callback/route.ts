import { NextResponse } from "next/server";

// OAuth callback — Supabase will redirect here after Google/Apple sign-in.
// We forward everything (code + verifier) to a client page that can run
// supabase.auth.exchangeCodeForSession() in the browser, which writes the
// session to localStorage where the rest of the app expects it.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    const msg = encodeURIComponent(errorDescription ?? error);
    return NextResponse.redirect(`${origin}/?auth_error=${msg}`);
  }

  if (code) {
    // Hand the code to the client-side handler page
    return NextResponse.redirect(`${origin}/auth/confirm?code=${code}`);
  }

  return NextResponse.redirect(`${origin}/`);
}
