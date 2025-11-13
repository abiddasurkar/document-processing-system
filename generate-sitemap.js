const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const { resolve } = require('path');

async function generateSitemap() {
  const sitemap = new SitemapStream({ 
    hostname: 'https://abiddasurkar.github.io/document-processing-system' 
  });

  const writeStream = createWriteStream(resolve(__dirname, 'build', 'sitemap.xml'));
  sitemap.pipe(writeStream);

  // Add URLs
  sitemap.write({ 
    url: '/', 
    changefreq: 'monthly', 
    priority: 1.0,
    lastmod: new Date().toISOString().split('T')[0]
  });

  sitemap.end();

  await streamToPromise(sitemap);
  console.log('✅ Sitemap generated successfully!');
}

generateSitemap().catch(console.error);