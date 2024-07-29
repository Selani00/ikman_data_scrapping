const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const dotenv = require('dotenv');
dotenv.config();
 
const port = process.env.SERVER_PORT || 9090;
const app = express();
 
app.use(cors({
    credentials: true
}));
 
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
 
const server = http.createServer(app);
 
server.listen(port, () => {
    console.log(`Server running on > http://localhost:${port}/`);
});
 
app.get('/test', (req, res) => {
    res.send('test method succeed');
});
 
class VehicleDTO {
    constructor({
        brand,
        make,
        imageURL,
        manufacturedYear,
        registeredYear,
        mileage,
        price,
        location,
        locationLong,
        locationLat,
        fbAddLinkURL,
        description,
        fuelType,
        transmission,
        fetchedDateTime
    }) {
        this.brand = brand;
        this.make = make;
        this.imageURL = imageURL;
        this.manufacturedYear = manufacturedYear;
        this.registeredYear = registeredYear;
        this.mileage = mileage;
        this.price = price;
        this.location = location;
        this.locationLong = locationLong;
        this.locationLat = locationLat;
        this.fbAddLinkURL = fbAddLinkURL;
        this.description = description;
        this.fuelType = fuelType;
        this.transmission = transmission;
        this.fetchedDateTime = fetchedDateTime;
    }
}
 
const fetchMarketplaceData = async (
    keyword,
    latitude,
    longitude,
    radiusKm = 65,
    sortBy = "CREATION_TIME_DESCEND",
    cursor = null
) => {
    console.log(`Fetching data at ${new Date().toLocaleTimeString()}`);
    const query = {
        buyLocation: { latitude, longitude },
        contextual_data: null,
        count: 24,
        cursor: null,
        params: {
            bqf: {
                callsite: "COMMERCE_MKTPLACE_WWW",
                query: keyword,
            },
            browse_request_params: {
                filter_location_latitude: latitude,
                filter_location_longitude: longitude,
                filter_radius_km: radiusKm,
                commerce_search_sort_by: sortBy,
            },
            custom_request_params: {
                browse_context: null,
                contextual_filters: [],
                referral_code: null,
                saved_search_strid: null,
                search_vertical: "C2C",
                seo_url: null,
                surface: "SEARCH",
                virtual_contextual_filters: [],
            },
        },
        savedSearchID: null,
        savedSearchQuery: keyword,
        scale: 2,
        shouldIncludePopularSearches: true,
        topicPageParams: {
            location_id: "melbourne",
            url: null,
        },
    };
 
    const body = `av=0&__aaid=0&__user=0&__a=1&__req=4m&__hs=19910.HYP%3Acomet_plat_default_pkg.2.1..0.0&dpr=2&__ccg=MODERATE&__rev=1014705164&__s=7ldk80%3Aj71z4k%3Aul8otm&__hsi=7388405028978404691&__dyn=7xeUmwlE7ibwKBAg5S1Dxu13wIwk8KewSwMwNw9G2S0im3y4o0B-q1ew65xO0FE2awt81s8hwGwQw9m1YwBgao6C0Mo2swaO4U2exi4UaEW1GwkEbrwKxm5o2eUlwhE2FBx_w47wzwJwSyES0gq0Lo6-3u362-2B0Rw8m1Iwqo4e0R8627E5y1rw&__csr=g8AQzbnZ8YitUxkBKjqdVJk9DVmgNqUWEGXiy8CZfDJzoWEgxi5Vd2okV96KmU-qvBKVUO4K786K8UhUc8cEgwEK2qdw-wBxC2B5wv9oeEhxiquEmwLwMwWwPUowpU7-1YwSzo47wlV8GewVyopwuF84K12wn9o1eo33w0qmo0Fm0R43C02l2K00JlE6OcyK0jy9waW4o0k7w2HUdo0n1w1Oq3K3N04oyG85pU0oQCzAfxq0fZClw1tJ0Mw9e9w0wLw0yDw1GS0rusw4Qw0dqo1X6&__comet_req=2&lsd=AVqBOmHCeZk&jazoest=2955&__spin_r=1014705164&__spin_b=trunk&__spin_t=1720247098&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometMarketplaceSearchContentContainerQuery&variables=${encodeURIComponent(
        JSON.stringify(query)
    )}&server_timestamps=true&doc_id=7996005813755908`;
 
   // console.log(body);
    try {
        const response = await fetch("https://www.facebook.com/api/graphql/", {
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded",
                "sec-ch-ua-mobile": "?1",
                "sec-ch-ua-model": '"Nexus 6"',
                "sec-ch-ua-platform": '"Android"',
                "sec-ch-ua-platform-version": '"6.0"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-fb-friendly-name": "CometMarketplaceSearchContentContainerQuery",
            },
            referrerPolicy: "strict-origin-when-cross-origin",
            body: body,
            method: "POST",
            mode: "cors",
            credentials: "include",
        });
 
        const data = await response.json();
        console.log("Data",data.data);
         

        if (
            data.data &&
            data.data.marketplace_search &&
            data.data.marketplace_search.feed_units
        ) {
            const vehicleDTOs = data.data.marketplace_search.feed_units.edges.map((edge) => {
                const listing = edge.node.listing;
                
                
                
                return new VehicleDTO({
                    brand: listing.marketplace_listing_title.split(' ')[1] || '',
                    make: listing.marketplace_listing_title.split(' ')[0] || '',
                    imageURL: listing.primary_listing_photo.image.uri,
                    manufacturedYear: listing.custom_sub_titles_with_rendering_flags[0]?.subtitle.split(' ')[0] || '',
                    registeredYear: '', // Need additional data for this
                    mileage: listing.custom_sub_titles_with_rendering_flags[0]?.subtitle.split(' ')[1] || '',
                    price: listing.listing_price.formatted_amount,
                    location: listing.location.reverse_geocode.city_page.display_name,
                    locationLong: longitude.toString(),
                    locationLat: latitude.toString(),
                    fbAddLinkURL: `https://www.facebook.com/marketplace/item/${listing.id}`,
                    description: listing.custom_title || listing.marketplace_listing_title,
                    fuelType: '', // Need additional data for this
                    transmission: '', // Need additional data for this
                    fetchedDateTime: new Date().toISOString()
                });
            });

            return vehicleDTOs;
            
        } else {
            console.error("No data found:", data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
 
const keyword = "bmw";
const latitude = -37.814;
const longitude = 144.96332;
 
app.get('/get', async (req, res) => {
    try {
        const vehicleDTOs = await fetchMarketplaceData(keyword, latitude, longitude);
        const html = vehicleDTOs.map(vehicle => `
            <div class="card" style="width: 18rem;">
                <img src="${vehicle.imageURL}" class="card-img-top" alt="${vehicle.description}">
                <div class="card-body">
                    <h5 class="card-title">${vehicle.make} ${vehicle.brand}</h5>
                    <p class="card-text">${vehicle.description}</p>
                    <p class="card-text">Price: ${vehicle.price}</p>
                    <p class="card-text">Location: ${vehicle.location}</p>
                    <a href="${vehicle.fbAddLinkURL}" class="btn btn-primary">View on Facebook</a>
                </div>
            </div>
        `).join('');
        const responseHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
                <title>Vehicle Listings</title>
              <script>
                    function getRandomRefreshTime() {
                        const min = 180000; // 1 minute in milliseconds
                        const max = 240000; // 3 minutes in milliseconds
                        return Math.random() * (max - min) + min;
                    }
                    setTimeout(() => {
                        window.location.reload();
                    }, getRandomRefreshTime());
                </script>
            </head>
            <body>
                <div class="container">
                    <div class="row">
                        ${html}
                    </div>
                </div>
            </body>
            </html>
        `;
        res.send(responseHTML);
    } catch (error) {
        console.error('Error in fetchMarketplaceData:', error);
        res.status(500).json({ error: error.message });
    }
});