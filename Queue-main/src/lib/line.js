const ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;

/**
 * Sends a push message to a specific user.
 * @param {string} to - LINE User ID
 * @param {Array} messages - Array of LINE message objects
 */
export async function sendPushMessage(to, messages) {
    if (!to || !ACCESS_TOKEN) {
        console.warn('Missing lineUserId or Channel Access Token');
        return;
    }

    try {
        const res = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify({ to, messages })
        });
        
        if (!res.ok) {
            const error = await res.json();
            console.error('LINE Push Error:', error);
        }
    } catch (err) {
        console.error('LINE Fetch Error:', err);
    }
}

/**
 * Sends a reply message to a user.
 * @param {string} replyToken - LINE Reply Token
 * @param {Array} messages - Array of LINE message objects
 */
export async function sendReplyMessage(replyToken, messages) {
    if (!replyToken || !ACCESS_TOKEN) {
        console.warn('Missing replyToken or Channel Access Token');
        return;
    }

    try {
        const res = await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify({ replyToken, messages })
        });
        
        if (!res.ok) {
            const error = await res.json();
            console.error('LINE Reply Error:', error);
        }
    } catch (err) {
        console.error('LINE Fetch Error:', err);
    }
}
