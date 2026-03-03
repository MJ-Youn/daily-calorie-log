import { SignJWT } from 'jose';

interface Env {
    TURNSTILE_SECRET_KEY: string;
    JWT_SECRET: string;
}

interface TurnstileVerifyResponse {
    success: boolean;
    'error-codes': string[];
    challenge_ts?: string;
    hostname?: string;
}

/**
 * Cloudflare Turnstile 토큰을 검증하고, 유효한 경우 인증 쿠키를 설정합니다.
 *
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-30
 */
export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
    const { request, env } = context;
    
    try {
        const body = await request.json() as { token: string };
        const token = body.token;
        const ip = request.headers.get('CF-Connecting-IP');

        // Verify the token with Cloudflare
        const formData = new FormData();
        formData.append('secret', env.TURNSTILE_SECRET_KEY);
        formData.append('response', token);
        if (ip) {
            formData.append('remoteip', ip);
        }

        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            body: formData,
            method: 'POST',
        });

        const outcome = await result.json() as TurnstileVerifyResponse;

        if (!outcome.success) {
            console.error('Turnstile verification failed:', outcome);
            return new Response(JSON.stringify({ 
                error: 'Invalid token', 
                details: outcome['error-codes'] 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verification successful
        // Generate a signed JWT for human verification
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const verificationToken = await new SignJWT({ human_verified: true })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('1h')
            .sign(secret);

        // Set a cookie valid for 1 hour
        const isProd = new URL(request.url).hostname !== 'localhost';
        const headers = new Headers();
        headers.append('Set-Cookie', `human_verified=${verificationToken}; Path=/; Max-Age=3600; ${isProd ? 'Secure; ' : ''}SameSite=Lax; HttpOnly`);
        headers.append('Content-Type', 'application/json');

        return new Response(JSON.stringify({ success: true }), {
            headers,
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
};
