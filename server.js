const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");
const dotenv = require("dotenv");
const puppeteer = require("puppeteer");

dotenv.config();

const port = process.env.SERVER_PORT || 9090;
const app = express();

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on > http://localhost:${port}/`);
});

const HEADLESS = true;

app.get("/getData", async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: HEADLESS });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    // Set user-agent to avoid detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    const url = `https://ikman.lk/en/ads/sri-lanka/vehicles`;
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("scraping....");

    // Scroll and load all products
    let previousHeight;
    while (true) {
      try {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        break;
      }
    }

    const data = await page.evaluate(() => {
      const productElements = document.querySelectorAll('li.normal--2QYVk.gtm-normal-ad');
      const products = Array.from(productElements).map((product) => {
        const priceElement = product.querySelector('.price--3SnqI');
        const locationElement = product.querySelector('.description--2-ez3');
        const linkElement = product.querySelector('a');
        const descriptionElement = product.querySelector('.heading--2eONR');
        // const imageElement = product.querySelector('img');

        const price = priceElement ? priceElement.innerText : "N/A";
        const location = locationElement ? locationElement.innerText : "N/A";
        const link = linkElement ? linkElement.href : "N/A";
        const description = descriptionElement ? descriptionElement.innerText : "N/A";
        // const image = imageElement ? imageElement.src : "N/A";

        return {
          price,
          location,
          link,
          description,
          // image,
        };
      });

      return products;
    });

    await browser.close();

    // Return the data as JSON
    res.json(data);

  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'An error occurred while scraping data.' });
  }
});

app.get("/test", (req, res) => {
  res.send("test method succeed");
});
