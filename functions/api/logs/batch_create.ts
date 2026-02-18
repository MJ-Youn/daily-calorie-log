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
    let body;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { items, recorded_date } = body;

    // 3. Validation
    if (!recorded_date || typeof recorded_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(recorded_date)) {
        return new Response(JSON.stringify({ error: 'Invalid recorded_date format (YYYY-MM-DD required)' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid items: must be a non-empty array' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    for (const item of items) {
        if (!item || typeof item !== 'object') {
            return new Response(JSON.stringify({ error: 'Invalid item: each item must be an object' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        if (item.type !== 'FOOD' && item.type !== 'EXERCISE') {
            return new Response(JSON.stringify({ error: 'Invalid item type: must be FOOD or EXERCISE' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const content = item.content || item.name;
        if (!content || typeof content !== 'string' || content.trim() === '') {
            return new Response(JSON.stringify({ error: 'Invalid item content: must be a non-empty string' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (typeof item.calories !== 'number') {
            return new Response(JSON.stringify({ error: 'Invalid item calories: must be a number' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (item.protein !== undefined && (typeof item.protein !== 'number' || item.protein < 0)) {
            return new Response(JSON.stringify({ error: 'Invalid item protein: must be a non-negative number' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (item.category !== undefined && item.category !== null && typeof item.category !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid item category: must be a string' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }

    try {
        // 4. Prepare Batch Insert
        const statements = items.map((item) => {
            return env.DB.prepare('INSERT INTO activity_logs (user_id, type, content, calories, protein, recorded_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(
                userId,
                item.type,
                item.content || item.name,
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
