interface Env {
    GEMINI_API_KEY: string;
    JWT_SECRET: string;
}

/**
 * AI를 사용하여 사용자의 텍스트 입력을 분석하는 API 엔드포인트입니다.
 * Gemini API를 호출하여 입력된 문자열에서 음식 섭취량 및 운동량을 추출합니다.
 *
 * @author 윤명준 (MJ Yune)
 * @since 2026-01-28
 * @param {any} context Cloudflare Worker context
 * @returns {Promise<Response>} 분석 결과 JSON 응답
 */
export const onRequestPost = async (context: { request: Request; env: Env }): Promise<Response> => {
    const { request, env } = context;

    // 1. 사용자 세션 체크 (보안 강화)
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader || !cookieHeader.includes('auth_token=')) {
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const { text } = await request.json();
        if (!text) {
            return new Response('Missing text input', { status: 400 });
        }

        const apiKey = env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response('Server configuration error: Missing Gemini API Key', { status: 500 });
        }

        // 2. Gemini API에 전달할 프롬프트 구성
        const prompt = `
      Analyze the following text describing food intake or exercise.
      Break it down into individual distinct items.
      
      For each item, extract:
      - "type": "FOOD" or "EXERCISE"
      - "name": Short description (string). MUST be in Korean (translate if necessary).
      - "calories": number (positive integer for food, negative for exercise)
      - "protein": number (in grams, 0 if not applicable)
      - "category": One of "BREAKFAST", "LUNCH", "DINNER", "SNACK", "MORNING_EXERCISE", "EVENING_EXERCISE", "OTHER" (Infer based on context like "morning", "lunch", or food type)
      
      Output Schema:
      {
        "items": [
          { "type": "...", "name": "...", "calories": 0, "protein": 0, "category": "..." }
        ]
      }
      
      Return ONLY the raw JSON object. No Markdown. No comments.
      
      Text: "${text}"
    `;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
            }),
        });

        const data: { candidates?: { content: { parts: { text: string }[] } }[]; error?: { message: string } } = await response.json();

        if (!response.ok) {
            // console.error('Gemini API Error:', JSON.stringify(data));
            throw new Error(data.error?.message || 'Gemini API request failed');
        }

        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            throw new Error('Failed to get response from Gemini: No text generated');
        }

        // 마크다운 형식 제거 및 JSON 파싱
        const jsonString = rawText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        let result;
        try {
            result = JSON.parse(jsonString);
        } catch {
            throw new Error('Failed to parse AI response');
        }

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
};
