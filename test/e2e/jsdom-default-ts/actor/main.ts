import { Actor } from 'apify';
import { JSDOMCrawler, Dataset } from '@crawlee/jsdom';
import assert from 'node:assert';

if (process.env.STORAGE_IMPLEMENTATION === 'LOCAL') {
    // @ts-ignore
    await Actor.init({ storage: new (await import('@apify/storage-local')).ApifyStorageLocal() });
} else {
    await Actor.init();
}

const crawler = new JSDOMCrawler();

crawler.router.addDefaultHandler(async ({ window, document, enqueueLinks, request, log }) => {
    const { url } = request;
    await enqueueLinks({
        globs: ['https://crawlee.dev/docs/**'],
    });

    const pageTitle = window.document.title;
    const { title } = document;
    assert.strictEqual(pageTitle, title);
    log.info(`URL: ${url} TITLE: ${pageTitle}`);

    await Dataset.pushData({ url, pageTitle });
});

await crawler.run(['https://crawlee.dev/docs/quick-start']);

await Actor.exit({ exit: Actor.isAtHome() });
