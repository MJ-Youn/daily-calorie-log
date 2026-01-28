import { jwtVerify } from 'jose';

interface Env {
    JWT_SECRET: string;
    DB: any;
}

/**
 * 관리자 요약 통계 및 로그 정보를 조회하는 API 엔드포인트입니다.
 * 전체 사용자 수, 전체 로그 수 및 필터링된 최근 활동 로그를 반환합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {any} context Cloudflare Worker context
 * @returns {Promise<Response>} 통계 및 로그 데이터
 */
export const onRequestGet = async (context: { request: Request; env: Env }): Promise<Response> => {
    const { request, env } = context;

    // 1. 관리자 권한 확인
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
        return new Response('Unauthorized', { status: 401 });
    }

    const cookies = Object.fromEntries(cookieHeader.split('; ').map((c: string) => {
        return c.split('=');
    }));
    const token = cookies['auth_token'];
    if (!token) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'ADMIN') {
            return new Response('Forbidden: Admin access required', { status: 403 });
        }
    } catch {
        return new Response('Invalid Token', { status: 401 });
    }

    try {
        // Parse Query Params
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const search = url.searchParams.get('search') || '';

        const offset = (page - 1) * limit;

        // 2. Fetch System Stats (Totals)
        const totalUsersReq = env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
        const totalLogsAllReq = env.DB.prepare('SELECT COUNT(*) as count FROM activity_logs').first();

        // 3. Build Query for Logs with Filters
        let whereClause = '';
        const params: (string | number)[] = [];

        if (search) {
            whereClause = `
                WHERE (
                    u.name LIKE ? OR 
                    u.email LIKE ? OR 
                    l.content LIKE ? OR
                    l.type LIKE ?
                )
            `;
            const likeTerm = `%${search}%`;
            params.push(likeTerm, likeTerm, likeTerm, likeTerm);
        }

        // Count filtered logs for pagination
        const countQuery = `
            SELECT COUNT(*) as count 
            FROM activity_logs l 
            JOIN users u ON l.user_id = u.id 
            ${whereClause}
        `;
        const filteredCountReq = env.DB.prepare(countQuery).bind(...params).first();

        // Fetch logs
        const logsQuery = `
            SELECT l.*, u.email, u.name 
            FROM activity_logs l 
            JOIN users u ON l.user_id = u.id 
            ${whereClause}
            ORDER BY l.created_at DESC 
            LIMIT ? OFFSET ?
        `;
        const logsParams = [...params, limit, offset];
        const logsReq = env.DB.prepare(logsQuery).bind(...logsParams).all();

        const [totalUsers, totalLogsAll, filteredCount, logsResult] = await Promise.all([
            totalUsersReq,
            totalLogsAllReq,
            filteredCountReq,
            logsReq
        ]);

        return new Response(
            JSON.stringify({
                totalUsers: (totalUsers as { count: number }).count,
                totalLogs: (totalLogsAll as { count: number }).count, // 전체 시스템 로그 수
                filteredTotal: (filteredCount as { count: number }).count, // 검색 조건에 맞는 로그 수
                recentLogs: logsResult.results,
                page,
                limit,
                totalPages: Math.ceil((filteredCount as { count: number }).count / limit)
            }),
            {
                headers: { 'Content-Type': 'application/json' },
            },
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
};
