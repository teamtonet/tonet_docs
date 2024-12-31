/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://docs.tonet.ai/',
  generateRobotsTxt: true, // (optional)
  // ...other options
}
