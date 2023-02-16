import setCookie from "../utils/setCookie.js";

export default async function collectRecords(page, since) {
    let result = {};

    const cookie = "xxx";
    const domain = ".i.51job.com";
    await setCookie(page, cookie, domain);

    await page.goto("https://i.51job.com/userset/my_apply.php?lang=c", {
        waitUntil: "load",
    });

    let tabs = await page.$$('.myStates > a');
    for (let i = 0; i < tabs.length; i++) {
        let tabName = await page.evaluate(el => el.textContent, tabs[i]);
        tabName = tabName.trim();
        result[tabName] = [];
        await Promise.all([tabs[i].click(), page.waitForNavigation()]);
        tabs = await page.$$('.myStates > a');
        let records = await page.$$('.apox > .e');
        label: while (records.length) {
            const promises = records.map(r =>
                page.evaluate(el => ({
                    companyName: el.querySelector('a.gs').title,
                    time: el.querySelector('.rq > span').textContent,
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
            const nextPageButton = await page.$('.dw_page ul > li:last-child');
            const nodeName = await page.evaluate(
                (el) => el.children[0].nodeName,
                nextPageButton
            );
            if (nodeName.toLowerCase() === 'span') {
                break;
            }
            await Promise.all([nextPageButton.click(), page.waitForNavigation()]);
            tabs = await page.$$('.myStates > a');
            records = await page.$$('.apox > .e');
        }
    }

    return result;
}