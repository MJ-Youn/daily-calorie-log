export const onRequestGet = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const client_id = env.GOOGLE_CLIENT_ID;
    const redirect_uri = env.GOOGLE_REDIRECT_URI || `${url.origin}/api/auth/callback`;

    // Scopes: info for profile, email
    const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=online&prompt=select_account`;

    return Response.redirect(authUrl, 302);
};
