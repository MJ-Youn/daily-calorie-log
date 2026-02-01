import { getSession } from '../auth/me';

interface Env {
    DB: any;
}

/**
 * 특정 활동 로그를 삭제하는 API 엔드포인트입니다.
 * 요청된 로그 ID가 현재 사용자의 소유인지 확인 후 삭제를 처리합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {any} context Cloudflare Worker context
 * @returns {Promise<Response>} 삭제 성공 여부 JSON
 */
export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
    const { request, env } = context;

    try {
        const user = await getSession(request, env);
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const { id } = await request.json();
        if (!id) {
            return new Response(JSON.stringify({ error: 'Missing log ID' }), { status: 400 });
        }

        const db = env.DB;
        // Ensure the log belongs to the user
        const result = await db.prepare('DELETE FROM activity_logs WHERE id = ? AND user_id = ?').bind(id, user.sub).run();

        if (result.success && result.meta.changes > 0) {
            return new Response(JSON.stringify({ success: true }));
        } else {
            return new Response(JSON.stringify({ error: 'Log not found or unauthorized' }), { status: 404 });
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
};
