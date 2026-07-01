import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/daily";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert user profile
      await supabase.from("users").upsert(
        {
          id: data.user.id,
          email: data.user.email!,
          username:
            data.user.user_metadata?.name ??
            data.user.user_metadata?.full_name ??
            null,
          avatar_url: data.user.user_metadata?.avatar_url ?? null,
          streak_current: 0,
          streak_best: 0,
          total_games: 0,
          total_wins: 0,
          total_points: 0,
          achievements: [],
        },
        { onConflict: "id", ignoreDuplicates: true }
      );

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
