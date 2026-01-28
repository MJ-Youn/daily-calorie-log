export const onRequestPost = async (context) => {
    return new Response('Logged out', {
        headers: {
            'Set-Cookie': 'auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
        },
    });
};
