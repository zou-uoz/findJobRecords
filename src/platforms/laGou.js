import setCookie from "../utils/setCookie.js";

export default async function collectRecords(page, since) {
    let result = {};

    const cookie = "xxx";
    const domain = ".www.lagou.com";
    await setCookie(page, cookie, domain);

    await page.goto("https://www.lagou.com/mycenter/delivery.html?tag=0", {
        waitUntil: "load",
    });

    let tabs = await page.$$('.delivery_tabs li');
    for (let i = 0; i < tabs.length; i++) {
        let tabName = await page.evaluate(el => el.textContent, tabs[i]);
        tabName = tabName.trim();
        result[tabName] = [];
        const a = await tabs[i].$('a');
        await Promise.all([a.click(), page.waitForNavigation()]);
        tabs = await page.$$('.delivery_tabs li');
        let records = await page.$$('ul.my_delivery > li');
        label: while (records.length) {
            const promises = records.map(r =>
                page.evaluate(el => ({
                    companyName: el.querySelector('.d_company > a').title,
                    time: el.querySelector('.d_time').textContent,
                }), r)
            );

            for (let promise of promises) {
                let item = await promise;
                const isRecent = new Date(item.time).getTime() >= new Date(since).getTime();
                if (isRecent) {
                    result[tabName].push(item.companyName + '/' + item.time);
                } else {
                    break label;
                }
            }

            const nextPageButton = await page.waitForSelector('.Pagination.myself > *:nth-last-child(2)');
            const nodeName = await page.evaluate(
                el => el.nodeName,
                nextPageButton
            );
            if (nodeName.toLowerCase() === 'span') {
                break;
            }
            await Promise.all([nextPageButton.click(), page.waitForNavigation()]);
            tabs = await page.$$('.delivery_tabs li');
            records = await page.$$('ul.my_delivery > li');
        }
    }

    return result;
}