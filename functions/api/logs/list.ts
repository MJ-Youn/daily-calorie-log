import { jwtVerify } from 'jose';

interface Env {
    JWT_SECRET: string;
    DB: {
        prepare: (s: string) => {
            bind: (...values: (string | number | undefined | null)[]) => {
                all: () => Promise<{ results: Record<string, unknown>[] }>;
            };
        };
    };
}

/**
 * 특정 날짜의 활동 로그 목록을 조회하는 API 엔드포인트입니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {any} context Cloudflare Worker context
 * @returns {Promise<Response>} 로그 목록 JSON
 */
export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
    const { request, env } = context;
    const url = new URL(request.url);
    const date = url.searchParams.get('date'); // YYYY-MM-DD

    // 1. Verify User
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return new Response('Unauthorized', { status: 401 });

    const cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => c.trim().split('='))
    );
    const token = cookies['auth_token'];
    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    let userId: string | number;
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        userId = payload.sub as string;
    } catch {
        return new Response('Invalid Token', { status: 401 });
    }

    try {
        let query = 'SELECT * FROM activity_logs WHERE user_id = ?';
        const params = [userId];

        if (date) {
            query += ' AND recorded_date = ?';
            params.push(date);
        }

        query += ' ORDER BY created_at DESC';

        const { results } = await env.DB.prepare(query)
            .bind(...params)
            .all();

        return new Response(JSON.stringify({ 
            logs: results,
            _debug: { userId, date } 
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
};
