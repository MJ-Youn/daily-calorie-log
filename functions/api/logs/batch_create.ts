import { getSession } from '../auth/me';

interface D1PreparedStatement {
    bind: (...values: (string | number | boolean | null)[]) => D1PreparedStatement;
}

interface Env {
    JWT_SECRET: string;
    DB: {
        prepare: (s: string) => D1PreparedStatement;
        batch: (statements: D1PreparedStatement[]) => Promise<unknown[]>;
    };
}

/**
 * 여러 개의 활동 로그를 한 번에 생성하는 API 엔드포인트입니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {any} context Cloudflare Worker context
 * @returns {Promise<Response>} 생성 결과 JSON
 */
export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
    const { request, env } = context;

    // 1. Verify User
    const user = await getSession(request, env);
    if (!user) return new Response('Unauthorized', { status: 401 });

    const userId = user.sub;

    // 2. Parse Body
    const { items, recorded_date } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
        return new Response('Invalid items', { status: 400 });
    }

    try {
        // 3. Prepare Batch Insert
        const statements = items.map((item) => {
            return env.DB.prepare('INSERT INTO activity_logs (user_id, type, content, calories, protein, recorded_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
                userId,
                item.type,
                item.name,
                item.calories,
                item.protein || 0,
                recorded_date,
                item.category || null,
            );
        });

        const results = await env.DB.batch(statements);

        return new Response(JSON.stringify({ success: true, count: results.length }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
};
