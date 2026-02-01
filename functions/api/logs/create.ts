import { getSession } from '../auth/me';

export const onRequestPost = async (context: any) => {
    const { request, env } = context;

    // 1. Verify User
    const user = await getSession(request, env);
    if (!user) return new Response('Unauthorized', { status: 401 });

    const userId = user.sub;

    // 2. Parse Body
    const { type, content, calories, protein, recorded_date } = await request.json();

    try {
        // 3. Insert into D1
        const result = await env.DB.prepare('INSERT INTO activity_logs (user_id, type, content, calories, protein, recorded_date) VALUES (?, ?, ?, ?, ?, ?)').bind(userId, type, content, calories, protein, recorded_date).run();

        return new Response(JSON.stringify({ success: true, id: result.meta.last_row_id }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
