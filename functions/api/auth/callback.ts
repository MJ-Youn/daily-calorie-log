import { SignJWT } from 'jose';

/**
 * Google OAuth 콜백을 처리하는 API 엔드포인트입니다.
 * 인증 코드를 토큰으로 교환하고 사용자 정보를 조회하여 세션을 생성합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {any} context Cloudflare Worker context
 * @returns {Promise<Response>} 대시보드 리다이렉트 또는 에러 응답
 */
export const onRequestGet = async (context: any) => {
    const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  const client_id = env.GOOGLE_CLIENT_ID;
  const client_secret = env.GOOGLE_CLIENT_SECRET;
  const redirect_uri = env.GOOGLE_REDIRECT_URI || "http://localhost:5173/api/auth/callback";

  try {
    // 1. Exchange code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return new Response(JSON.stringify(tokenData), { status: 400 });
    }

    // 2. Get User Info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userResponse.json();

    // 3. Save/Update User in D1
    const { email, name, picture } = userData;
    
    // Check if user exists
    const existingUser = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    let userId;
    let role = 'USER';

    if (!existingUser) {
        // Create new user
        // Grant admin role if matches specific username (simple hardcoded check for MVP)
        if (email === 'younmyungjun@gmail.com') {
             role = 'ADMIN';
        }
        
        const result = await env.DB.prepare(
            "INSERT INTO users (email, name, picture, role) VALUES (?, ?, ?, ?) RETURNING id"
        ).bind(email, name, picture, role).first();
        userId = result.id;
    } else {
        userId = existingUser.id;
        role = existingUser.role;
        // Optional: Update name/picture if changed
    }

    // 4. Create JWT Session
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const jwt = await new SignJWT({ sub: String(userId), email, role, name, picture })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // 7 days session
      .sign(secret);

    // 5. Set Cookie and Redirect
    // Secure cookie attributes should be set strict for production
    const isProd = url.hostname !== 'localhost';
    const cookieString = `auth_token=${jwt}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${isProd ? '; Secure' : ''}`;

    return new Response(null, {
      status: 302,
      headers: {
        "Set-Cookie": cookieString,
        "Location": "/dashboard", // 로그인 후 대시보드로 이동
      },
    });

  } catch (error: any) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
};
