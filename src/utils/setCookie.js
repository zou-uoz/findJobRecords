export default async function (page, cookie, domain) {
    const cookieArray = cookie.split(";").map(_pair => {
        const pair = _pair.trim();
        const name = pair.slice(0, pair.indexOf("="));
        const value = pair.slice(pair.indexOf("=") + 1);
        return { name, value, domain };
    });
    await Promise.all(
        cookieArray.map(pair => {
            return page.setCookie(pair);
        })
    );
}