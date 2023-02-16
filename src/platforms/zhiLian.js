import setCookie from "../utils/setCookie.js";

export default async function collectRecords(page, since) {
    let result = {};

    const cookie = "xxx";
    const domain = ".i.zhaopin.com";
    await setCookie(page, cookie, domain);

    await page.goto("https://i.zhaopin.com/schedule?status=viewed", {
        waitUntil: "load",
    });

    const tabs = await page.$$('.st-nav > ul > li');
    for (let i = 0; i < tabs.length; i++) {
        let tabName = await page.evaluate(el => el.textContent, tabs[i]);
        tabName = tabName.trim();
        result[tabName] = [];
        await tabs[i].click();
        let records = await page.$$('.ji.js-item');
        console.log(tabName)
        console.log(records)
        console.log(records.length)
        label: while (records.length) {
            const promises = records.map(r =>
                page.evaluate(el => ({
                    companyName: el.querySelector('.ji-item-info-companyName').textContent,
                    time: el.querySelector('.ji-item-status-timer').textContent
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
            const nextPageButton = await page.$('.ivu-page-next');
            const classes = await page.evaluate(
                el => el.getAttribute('class'),
                nextPageButton
            );
            if (classes.includes("ivu-page-disabled")) {
                break;
            }
            await nextPageButton.click();
            records = await page.$$('.js.js-item');
        }
    }

    return result;
}