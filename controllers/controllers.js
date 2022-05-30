const res = require("express/lib/response")
const axios = require("axios")
const cheerio = require("cheerio")

const sources = [
  {
    id: "dexerto",
    url: "https://www.dexerto.com/esports/",
  },
  {
    id: "dotesports",
    url: "https://dotesports.com/",
  },
]

// functions that define actions to take when someone hits an API endpoint
const getArticles = async (req, res) => {
  let returnedArticles = []

  if (req.params.hasOwnProperty("source")) {
    // if user defines a news source, get articles from that news source
    const promArticles = fetchArticles(req.params.source)
    returnedArticles.push(promArticles)
  } else {
    //  if source is undefined, loop thru each source and return articles
    sources.forEach((src) => {
      const promArticles = fetchArticles(src.id)
      returnedArticles.push(promArticles)
    })
  }

  // TODO: flatten and sort articles by timestamp before returning results
  res.status(201).json(await Promise.all(returnedArticles))
}

const fetchArticles = async (sourceId, options) => {
  const sourceUrl = sources.find(
    (src) => src.id.toLowerCase() === sourceId.toLowerCase()
  ).url

  try {
    // make get request to URL
    // TODO: if 'options' are passed with URL, include them in the url.
    const response = await axios.get(sourceUrl)
    return scrapePageOfSource(response.data, sourceId)
  } catch (err) {
    throw new Error("Error fetching articles.", err)
  }
}

const scrapePageOfSource = (html, sourceId) => {
  if (sourceId.toLowerCase() === "dexerto") {
    return scrapeDexerto(html, sourceId)
  } else if (sourceId.toLowerCase() === "dotesports") {
    return scrapeDotEsports(html, sourceId)
  } else throw new Error("Source not supported for page scraping.")
}

/*
DEXERTO - Esports category page:

* Example post HTML:

* all elements are contained within a <div class="js-post-container" /> tag

* Title with link (rel=bookmark)
<h2 class="js-post-title"> ARTICLE TITLE </h2>

* category
<a href="https://www.dexerto.com/valorant/" class="js-category-link">
ARTICLE CATEGORY -- GAME, BUSINESS, ENTERTAINMENT </a>

* timestamp
<p class="js-published-date"> TIMESTAMP: '1-7 Days', '1 Week', etc. </p>

* THUMBNAIL ELEMENTS
<a class="w-1/2 md:w-full relative js-post-thumbnail-link" href="https://www.dexerto.com/valorant/scream-nivera-how-we-became-esports-most-dominant-brothers-esports-stories-1833549/">
    <picture class="image_main_grid w-full wp-post-image" loading="lazy">
    <source type="image/webp" srcset="https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera.jpg.webp 2048w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-300x169.jpg.webp 300w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-1024x575.jpg.webp 1024w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-768x431.jpg.webp 768w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-1536x863.jpg.webp 1536w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-800x450.jpg.webp 800w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-175x98.jpg.webp 175w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-1248x701.jpg.webp 1248w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-630x354.jpg.webp 630w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-479x269.jpg.webp 479w, https://www.dexerto.com/wp-content/uploads/2022/05/27/Scream-Nivera-150x84.jpg.webp 150w" sizes="(max-width: 640px) 50vw, (max-width: 767px) 294px, (max-width: 979px) 167px, (max-width: 1299px) 220px, 300px">
    </picture>
</a>

*/

// web-scraping helpers:
const formatDexertoTimeStamp = (timeString) => {
  // timeString format: '1-7 Days', '1 Week', '1 Month', etc.
  // given a time string in this format, return a JS date obj = currentDate - timeString

  const currentDate = new Date()
  const timeAgo = Number(timeString.slice(0, timeString.indexOf(" "))) // grab first two chars and cast to num: Ex: '1 ', '12'
  const timeStr = timeString.toLowerCase() // case insensitivity

  if (timeStr.includes("hour"))
    currentDate.setHours(currentDate.getHours() - timeAgo) // domain: 1 - 24 HOURS AGO
  if (timeStr.includes("day"))
    currentDate.setDate(currentDate.getDate() - timeAgo) // domain: 1 - 7 DAYS AGO
  if (timeStr.includes("week"))
    currentDate.setDate(currentDate.getDate() - timeAgo * 7) // domain: 1 - 4 WEEKS AGO
  if (timeStr.includes("month"))
    currentDate.setMonth(currentDate.getMonth() - timeAgo) // domain: 1 - 12 MONTHS AGO
  if (timeStr.includes("year"))
    currentDate.setFullYear(currentDate.getFullYear() - timeAgo) // domain: >=1 YEARS AGO

  return currentDate.toJSON() // return new date (we modified the currentDate)
}

const scrapeDexerto = (html, sourceId) => {
  const $ = cheerio.load(html)
  const articles = []

  // all elements are contained within a <div class="js-post-container" /> tag
  $("div.js-post-container", html).each(function (i, el) {
    const title = $("h2.js-post-title", this).text()
    const link = $("a.js-post-title-link", this).attr("href")
    const category = {
      name: $("a.js-category-link", this).text().trim(),
      link: $("a.js-category-link", this).attr("href"),
    }
    const thumbnail = $("img", this).attr("data-lazy-src")
    const timestamp = formatDexertoTimeStamp(
      $("p.js-published-date", this).text()
    )

    const source = sourceId

    articles.push({
      source,
      title,
      link,
      category,
      thumbnail,
      timestamp,
    })
  })

  return articles
}

/* DOTESPORTS

URL: has path params for category and pagination
    example: https://dotesports.com/valorant/page/3

* Example post HTML:

*all elements are contained within a <article /> tag

*Categories list
<ul class="post-categories">
    <li><a href="https://dotesports.com/valorant" rel="category tag">Valorant</a></li>
</ul>

*Timestamp
<time class="entry-date published" datetime="2022-05-28T18:06:27-05:00">May 28, 2022 6:06 pm</time>

*Title with link (rel=bookmark)
<h3 class="entry-title"><a href="https://dotesports.com/valorant/news/sentinels-bad-luck-continues-falling-to-optic-without-main-roster" rel="bookmark">Sentinels’ bad luck continues, falling to Optic without main roster</a></h3>

*Lead-in
<p class="entry-lede"> Multiple substitutes for Sentinels led to an easy sweep for the defending Masters champions. </p>

*thumbnail link
<a class="post-thumbnail">
    <img width="640" height="427" class="wp-post-image" src="https://cdn1.dotesports.com/wp-content/uploads/2021/12/09145635/gambit-and-x10-vct-champs-768x512.jpg">
</a>

*/

const scrapeDotEsports = (html) => {
  return [{ msg: "from Dotesports" }]
}

module.exports = {
  getArticles,
}
