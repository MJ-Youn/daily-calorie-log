interface Env {
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    GEMINI_API_KEY: string;
    DB: any;
}

/**
 * 프로젝트 내 주요 서비스들의 상태를 점검하고 외부 링크를 제공하는 API 엔드포인트입니다.
 * Google Cloud, Gemini API, Cloudflare Workers, D1 Database 상태를 확인합니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {any} context Cloudflare Worker context
 * @returns {Promise<Response>} 서비스 상태 정보 JSON
 */
export const onRequestGet = async (context: { env: Env }): Promise<Response> => {
    const { env } = context;

    const status = {
        google: { status: 'UNKNOWN', message: '' },
        gemini: { status: 'UNKNOWN', message: '' },
        cloudflare: { status: 'OK', message: 'Worker is running' },
        d1: { status: 'UNKNOWN', message: '' },
        timestamp: new Date().toISOString(),
    };

    // 1. Check Google Config
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
        status.google = { status: 'OK', message: 'Credentials Configured' };
    } else {
        status.google = { status: 'ERROR', message: 'Missing Credentials' };
    }

    // 2. Check Gemini Config
    if (env.GEMINI_API_KEY) {
        status.gemini = { status: 'OK', message: 'API Key Configured' };
        // Optional: Could make a dummy call to verify key validity, but keeping it simple for now to avoid quota usage
    } else {
        status.gemini = { status: 'ERROR', message: 'Missing API Key' };
    }

    // 3. Check D1 Database
    try {
        const db = env.DB;
        await db.prepare('SELECT 1').run();
        status.d1 = { status: 'OK', message: 'Connected' };
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        status.d1 = { status: 'ERROR', message: errorMessage };
    }

    return new Response(JSON.stringify(status), {
        headers: { 'Content-Type': 'application/json' },
    });
};
