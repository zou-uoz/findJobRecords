import setCookie from "../utils/setCookie.js";

export default async function collectRecords(page) {
    let result = {};

    const cookie = "xxx";
    const domain = ".www.zhipin.com";
    await setCookie(page, cookie, domain);

    await page.goto("https://www.zhipin.com/web/geek/jobsfromchat?page=1&tag=5&isActive=true", {
        waitUntil: "load",
    });

    let tabs = await page.$$('.user-jobs-tab-nav > span');
    for (let i = 0; i < tabs.length; i++) {
        let tabName = await page.evaluate(el => el.textContent, tabs[i]);
        tabName = tabName.trim();
        result[tabName] = [];
        await tabs[i].hover();
        await tabs[i].click();
        let records = await page.$$('.user-jobs-ul > .item-boss');
        label: while (records.length) {
            const promises = records.map(r => {
                if (tabName === '面试') {
                    return page.evaluate(el => ({
                        companyName: el.querySelector('.info-company-name-row-2').textContent
                    }), r)
                }
                return page.evaluate(el => ({
                    companyName: el.querySelector('.company-info a').textContent
                }), r)
            });

            for (const promise of promises) {
                const item = await promise;
                result[tabName].push(item.companyName);
            }
            const nextPageButton = await page.waitForSelector('.ui-icon-arrow-right');
            const classes = await page.evaluate(
                (el) => el.parentElement.getAttribute('class'),
                nextPageButton
            );
            if (classes.includes('disabled')) {
                break;
            }
            await nextPageButton.click();
            records = await page.$$('.user-jobs-ul > .item-boss');
        }
    }

    return result;
}