import { jwtVerify } from 'jose';

interface Env {
    JWT_SECRET: string;
    DB: unknown;
}

interface UserPayload {
    sub: string;
    email: string;
    name: string;
    picture?: string;
    role?: string;
}

/**
 * 사용자 세션 정보를 확인하는 헬퍼 함수입니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {Request} request HTTP 요청 객체
 * @param {Env} env 환경 변수 객체
 * @returns {Promise<UserPayload | null>} 사용자 세션 정보 또는 null
 */
export async function getSession(request: Request, env: Env): Promise<UserPayload | null> {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
        return null;
    }

    const cookies = Object.fromEntries(cookieHeader.split('; ').map((c) => {
        return c.split('=');
    }));
    const token = cookies['auth_token'];
    if (!token) {
        return null;
    }

    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as UserPayload;
    } catch {
        return null;
    }
}

/**
 * 현재 로그인한 사용자 정보를 반환하는 API 엔드포인트입니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {any} context Cloudflare Worker context
 * @returns {Promise<Response>} 사용자 정보 JSON
 */
export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
    const { request, env } = context;
    const user = await getSession(request, env);

    return new Response(JSON.stringify({ user }), {
        headers: { 'Content-Type': 'application/json' },
    });
};
