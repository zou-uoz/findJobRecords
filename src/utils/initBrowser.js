import puppeteer from "puppeteer";

export default async function() {
    const browser = await puppeteer.launch({
        headless: false, //有浏览器界面启动
        slowMo: 250, //放慢浏览器执行速度，方便测试观察
        defaultViewport: { width: 1000, height: 1080 },
        ignoreHTTPSErrors: false, //忽略 https 报错
        // args: ["--start-fullscreen"]
    });

    return browser;
}