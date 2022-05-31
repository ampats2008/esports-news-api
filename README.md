# The eSports News API

Hi! This project is a REST API that returns the latest eSports-related articles from Dexerto and Dotesports, two of the most popular news outlets for eSports content.

## Data Structure

No matter which endpoint you choose to query, the data structure returned will always be an array of JSON objects with similar format.

| Field                    | Description                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------- |
| source                   | Unique ID of the news source. Also used for the source-specific endpoint (found below). |
| title                    | Name of the returned article                                                            |
| link                     | URL of the article on the news source's website.                                        |
| categories[]<sup>1</sup> | List of category objects (see next two rows for category object properties)..           |
| categories[i].name       | Name of the article's category on the news source's website. (see below).               |
| categories[i].link       | URL of list of articles related to the given category on the news source's website.     |
| thumbnail                | URL of the preview image used for the article.                                          |
| timestamp                | JSON DateTime string that indicates the Date/Time the article was published.            |
| slug<sup>2</sup>         | Subheading text of the article. Indicates what the article will be about.               |

1. There will usually be one category, but Dotesports articles may have more than one.
2. This field only exists on Dotesports articles.

Here is an example of a resource returned by the API:

```js
const dotEsportsArticle = {
    source: "dotesports",
    title: "10-9: LPL overtakes LCK in all-time head-to-head Bo5 record following MSI 2022",
    link: "https://dotesports.com/league-of-legends/news/10-9-lpl-overtakes-lck-in-all-time-head-to-head-bo5-record",
    categories: [
      {
        name: "League of Legends",
        link: "https://dotesports.com/league-of-legends"
      }
    ],
    thumbnail: "https://cdn1.dotesports.com/wp-content/uploads/2022/05/31042957/RNG-MSICrowdLineup-1-768x432.jpg",
    timestamp: "2022-05-31T04:33:08-05:00",
    slug: "The tables have turned."
},
```

## Endpoints

There are 3 valid endpoints for the API at this time:

1. GET Articles from All Sources

   > `https://api-esports-news.herokuapp.com/api/`

   This is the root endpoint for the API. It will fetch articles from all the supported news sources. They will be sorted from most recently published to oldest.

2. GET Articles from One Source

   > `https://api-esports-news.herokuapp.com/api/`<span style='color:mediumseagreen'>:source/</span>

   This endpoint allows you to return the latest articles from a specified news source. It corresponds to the `source` field found in each resource.

   For example, to get articles from _Dexerto_, you would make a GET request to `https://api-esports-news.herokuapp.com/api/dexerto/`.

## Query String Parameters

1. GET Articles by Category

   > `https://api-esports-news.herokuapp.com/api/`<span style='color:mediumseagreen'>?categories=category1,category2</span>

   The `categories` query string parameter allows you to filter the returned list of articles by desired topics.

   A valid category is any category that exists on the news source's website. For example, Dexerto has a category called _Business_, which you could filter by.

   Most categories, however, are popular eSports titles, and these categories are shared between both news sources. Therefore, if you filter by _Valorant_, you'll find articles from both Dexerto and Dotesports in the returned list.

   You can include multiple categories in a query by separating them with a comma. In the example URL above, we would get all of the articles of `category1` or `category2`.

2. GET Dotesports Articles using Pagination

   > `https://api-esports-news.herokuapp.com/api/dotesports`<span style='color:mediumseagreen'>?page=1</span>

   Dotesports' articles are published using pagination, so I have enabled you to target each page of articles using a `page` query string parameter. Integers greater than 0 are valid values for `page`. Higher values will return older articles.

   This can also be used in tandem with the `categories` query string parameter if you wish to filter out unrelated articles.
