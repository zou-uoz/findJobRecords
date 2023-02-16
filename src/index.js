import { writeFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

import { default as collectZhiLianRecords } from "./platforms/zhiLian.js";
import { default as collectLaGouRecords } from "./platforms/laGou.js";
import { default as collectWuYouRecords } from "./platforms/wuYou.js";
import { default as collectBossRecords } from "./platforms/boss.js";
import initBrowser from "./utils/initBrowser.js";

(async () => {
    const deliveredCompanies = {};

    const browser = await initBrowser();
    const page = await browser.newPage();
    deliveredCompanies["智联"] = await collectZhiLianRecords(page, '2023-02-10 00:00:00');
    deliveredCompanies["拉勾网"] = await collectLaGouRecords(page, '2023-02-10 00:00:00');
    deliveredCompanies["前程无忧"] = await collectWuYouRecords(page, '2023-02-10 00:00:00');
    deliveredCompanies["boss直聘"] = await collectBossRecords(page);
    await page.close();
    await browser.close();

    const data = new Uint8Array(Buffer.from(JSON.stringify(deliveredCompanies)));
    const promise = writeFile('output.json', data);
    await promise;
})();
