import { classifyUserAgent } from "../lib/botGuard";

const CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
const SAFARI_IOS =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";

describe("classifyUserAgent", () => {
  it.each([CHROME, SAFARI_IOS])("lets real browsers through", (ua) => {
    expect(classifyUserAgent(ua).block).toBe(false);
  });

  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
  ])("lets search engines and link previews through: %s", (ua) => {
    expect(classifyUserAgent(ua).block).toBe(false);
  });

  it.each([
    ["Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)", "gptbot"],
    ["Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)", "bytespider"],
    ["Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)", "ahrefsbot"],
  ])("blocks scraping crawlers", (ua, name) => {
    expect(classifyUserAgent(ua)).toEqual({ block: true, reason: `crawler: ${name}` });
  });

  it.each([
    "python-requests/2.32.3",
    "curl/8.7.1",
    "Go-http-client/2.0",
    "Scrapy/2.11 (+https://scrapy.org)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/130.0.0.0 Safari/537.36",
  ])("blocks scripts and headless browsers: %s", (ua) => {
    expect(classifyUserAgent(ua).block).toBe(true);
  });

  it.each([null, undefined, "", "   "])("blocks requests without a user agent (%p)", (ua) => {
    expect(classifyUserAgent(ua)).toEqual({ block: true, reason: "missing user agent" });
  });
});
