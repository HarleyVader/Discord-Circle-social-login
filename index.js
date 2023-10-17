const { request } = require('undici');
const express = require('express');
const { clientId, clientSecret, port } = require('./config.json');

const app = express();
app.get('/connect', async ({ query }, response) => {
    const { code } = query;

    if (code) {
        try {
            const tokenResponseData = await request('https://discord.com/api/oauth2/token', {

                method: 'POST',
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${port}`,
                    scope: 'identify',
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const oauthData = await tokenResponseData.body.json();
            
            if (oauthData.error) {
            return response.send({ status: "Not Ok" });
            }
            console.log("OAuth Check : " + code);
            console.log(oauthData);

            let discordUser = await fetch("https://discord.com/api/users/@me", {
            headers: {
                authorization: `${oauthData.token_type} ${oauthData.access_token}`
            }
            });
            discordUser = await discordUser.json();
            console.log(discordUser);
            console.log(oauthData);
            return response.send(discordUser);
        } catch (error) {
            console.error(error);
        }
    }
    return response.send({ status: "Not Ok" });
    
});
app.get('/', (_request, response) => {
    // Send the HTML file as a response
    return response.sendFile('index.html', { root: __dirname });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
