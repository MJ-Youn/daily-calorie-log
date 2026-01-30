interface Env {
    // Defines bindings
}

/**
 * 모든 요청을 가로채서 사람 인증 여부를 확인하는 미들웨어입니다.
 * 
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-30
 */
export const onRequest = async (context: { request: Request; next: () => Promise<Response>; env: Env }) => {
    const { request, next } = context;
    const url = new URL(request.url);

    // 제외할 경로 목록
    // 1. /verify 페이지 자체
    // 2. /api/verify-turnstile (검증 API)
    // 3. 정적 파일 (assets, images, etc.) - Vite 빌드 결과물 경로 패턴
    // 4. /login (로그인 페이지는 접근 허용해도 됨, 혹은 로그인 전에도 막을지 결정. 여기선 일단 허용)
    // 5. /api/auth/* (로그인 API 등)
    if (
        url.pathname === '/verify' ||
        url.pathname.startsWith('/api/verify-turnstile') ||
        url.pathname.startsWith('/api/auth/') || // 로그인/회원가입 등은 검증 전에도 호출 가능해야 함
        url.pathname.startsWith('/assets/') ||
        url.pathname.startsWith('/src/') || // Dev mode assets
        url.pathname.startsWith('/node_modules/') || // Dev mode assets
        url.pathname.startsWith('/@') || // Vite internals
        url.pathname.includes('.') // Files with extensions (css, js, png, etc.)
    ) {
        return next();
    }

    // 쿠키 확인
    const cookies = request.headers.get('Cookie') || '';
    if (!cookies.includes('human_verified=true')) {
        // API 요청인 경우 JSON 에러 반환 (리다이렉트 방지)
        if (url.pathname.startsWith('/api/')) {
            return new Response(
                JSON.stringify({
                    error: 'Human verification required',
                    verificationUrl: '/verify',
                }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // 인증되지 않음 -> /verify로 리다이렉트
        // 원래 가려던 페이지 정보를 쿼리 파라미터로 전달
        // 단, 이미 /verify로 가는 중이면 무한 루프 방지 (위에서 체크함)
        const nextUrl = new URL(url.origin);
        nextUrl.pathname = '/verify';
        nextUrl.searchParams.set('next', url.pathname + url.search);

        return Response.redirect(nextUrl.toString(), 302);
    }

    // 인증됨 -> 통과
    return next();
};
