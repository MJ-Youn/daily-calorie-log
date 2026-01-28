import { jwtVerify } from 'jose';

interface D1Database {
    prepare: (query: string) => {
        bind: (...values: (string | number)[]) => {
            all: () => Promise<{ results: Record<string, unknown>[] }>;
        };
    };
}

interface Env {
    JWT_SECRET: string;
    DB: D1Database;
}

/**
 * 사용자의 통계 정보를 조회하는 API 엔드포인트입니다.
 * 특정 기간(7일, 30일, 전체) 동안의 칼로리 섭취량 및 단백질 섭취량 추이를 반환합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {{ request: Request; env: Env }} context Cloudflare Worker context
 * @returns {Promise<Response>} 일자별 통계 데이터
 */
export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
    const { request, env } = context;
    const url = new URL(request.url);
    const range = url.searchParams.get('range') || '7'; // 기본값 7일

    // 1. 사용자 확인
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
        return new Response('Unauthorized', { status: 401 });
    }

    const cookies = Object.fromEntries(cookieHeader.split('; ').map((c) => {
        return c.split('=') as [string, string];
    }));
    const token = cookies['auth_token'];
    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    let userId: string;
    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        userId = payload.sub as string;
    } catch {
        return new Response('Invalid Token', { status: 401 });
    }

    try {
        // 2. D1 데이터베이스에서 통계 정보 조회
        const endDate = new Date();
        const startDate = new Date();

        if (range === 'ALL') {
             // 전체 조회를 위해 아주 오래된 날짜 설정
             startDate.setFullYear(2000, 0, 1); 
        } else {
             startDate.setDate(endDate.getDate() - parseInt(range));
        }

        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        const query = `
      SELECT 
        recorded_date,
        SUM(CASE WHEN type = 'FOOD' THEN calories ELSE -ABS(calories) END) as net_calories,
        SUM(protein) as total_protein
      FROM activity_logs 
      WHERE user_id = ? AND recorded_date >= ? AND recorded_date <= ?
      GROUP BY recorded_date
      ORDER BY recorded_date ASC
    `;

        const { results } = await env.DB.prepare(query).bind(userId, startStr, endStr).all();

        return new Response(JSON.stringify({ stats: results }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
};
