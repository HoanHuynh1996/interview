import { test, expect, Request, Response } from '@playwright/test';
import logger from '../logger/logger';
import { DiscoverPage } from '../pages/discoverpage';


let discoverPage: DiscoverPage;

const testDataFilterOption = [
    {
        type: "TV Shows",
        genre: ["Comedy", "Drama"],
        yearFrom: "1901",
        yearTo: "2024",
        rating: 4,
        expect: {
            numberOfReturnMoviesOnTheFirstPage: 20
        }
    },
    {
        type: "Movie",
        genre: ["Crime"],
        yearFrom: "1902",
        yearTo: "2023",
        rating: 1,
        expect: {
            numberOfReturnMoviesOnTheFirstPage: 20
        }
    }
];

test.beforeEach(async ({ page }) => {
    await page.goto('/');
    discoverPage = new DiscoverPage(page);
});

test.describe('Verify the Discover feature', () => {
    testDataFilterOption.forEach((filterOption) => {
        test(`Verify the filtering feature: ${JSON.stringify(filterOption, null, 2)}`, async ({ page, context }) => {
            await discoverPage.filterMovie(filterOption);
            await discoverPage.verifyTheNumberOfMoviesReturned(filterOption.expect.numberOfReturnMoviesOnTheFirstPage)
        });
    });

    test('Verify the category feature', async ({ page }) => {
        const testData = {
            category: "Trend",
            expect: {
                numberOfReturnMoviesOnTheFirstPage: 20
            }
        }
        await discoverPage.selectCategory(testData.category);
        await discoverPage.verifyTheNumberOfMoviesReturned(testData.expect.numberOfReturnMoviesOnTheFirstPage)

    });

    test('Verify the search feature', async ({ page }) => {
        const testData = {
            search: "The Great Texas Dynamite Chase",
            expect: {
                numberOfReturnMoviesOnTheFirstPage: 1
            }
        }
        await discoverPage.searchMovie(testData.search);
        await discoverPage.verifyTheNumberOfMoviesReturned(testData.expect.numberOfReturnMoviesOnTheFirstPage)
        await discoverPage.verifyTheNameOfMoviesReturned(testData.search)
    });

    test('Verify the combination of category, search, filter feature', async ({ page }) => {
        const filterOption = {
            type: "TV Shows",
            genre: ["Comedy"],
            yearFrom: "1990",
            yearTo: "2025",
            rating: 5,
            search: "Uncle Grandpa",
            category: "Trend",
            expect: {
                numberOfReturnMoviesOnTheFirstPage: 2
            }
        }
        await discoverPage.selectCategory(filterOption.category);
        await discoverPage.searchMovie(filterOption.search);
        await discoverPage.filterMovie(filterOption);
        await discoverPage.verifyTheNumberOfMoviesReturned(filterOption.expect.numberOfReturnMoviesOnTheFirstPage)

    });

    test('Verify the pagination feature', async ({ page }) => {
        const filterOption = {
            expect: {
                numberOfReturnMoviesOnTheFirstPage: 20
            }
        }
        await discoverPage.pagination("Next");
        await discoverPage.verifyTheNumberOfMoviesReturned(filterOption.expect.numberOfReturnMoviesOnTheFirstPage)
        await discoverPage.pagination("Previous");
        await discoverPage.verifyTheNumberOfMoviesReturned(filterOption.expect.numberOfReturnMoviesOnTheFirstPage)
        await discoverPage.pagination();
        await discoverPage.verifyTheNumberOfMoviesReturned(filterOption.expect.numberOfReturnMoviesOnTheFirstPage)
    });

    test('Verify that after refreshing the page should see page not found', async ({ page }) => {
        await page.reload();
        await discoverPage.verifyThepageNotFoundAppear();
    });

    test('Verify that after redirecting the page directly by URL should see page not found', async ({ page }) => {
        await page.goto("/trend")
        await discoverPage.verifyThepageNotFoundAppear();
    });

    test('Verify that user should see the No Results found message when searching with invalid data', async ({ page }) => {
        const testData = {
            search: "27834@#$34 test TEST",
            message: "No results found."
        }
        await discoverPage.searchMovie(testData.search);
        await discoverPage.verifyTheNoResultsFoundPage(testData.message)
    });

    test('Verify that FE send correct data on their API based on selected filters and its data reponse returned correctly', async ({ page }) => {
        const filterOption = {
            category: "Popular",
            type: "TV Shows",
            genre: ["Animation", "Comedy"],
            yearFrom: "2025",
            yearTo: "2025",
            rating: 3
        };
        const expectedParams = {
            sort_by: "popularity.desc",
            "release_date.gte": "2025-01-01",
            "release_date.lte": "2025-12-31",
            "vote_average.gte": "3",
            "vote_average.lte": "5",
            page: "1",
            with_genres: "16,35",//16 means Animation, 35 means Comedy
            api_key: "add494e96808c55b3ee7f940c9d5e5b6"
        };

        const requests: Request[] = [];
        const responses: Response[] = [];

        page.on("request", (req) => {
            if (
                req.url().includes("/discover/tv") &&
                req.method() === "GET"
            ) {
                requests.push(req);
            }
        });
        page.on("response", (res) => {
            if (
                res.url().includes("/discover/tv") &&
                res.request().method() === "GET"
            ) {
                responses.push(res);
            }
        });

        await discoverPage.selectCategory(filterOption.category);
        await discoverPage.filterMovie(filterOption);
        //wait for the last api call
        await page.waitForTimeout(1000)
        // get the last request/response
        const lastRequest = requests[requests.length - 1];
        const lastResponse = responses[responses.length - 1]
        const url = new URL(lastRequest.url());
        // assertion
        await discoverPage.verifyTheParams(url, expectedParams);
        await discoverPage.verifyTheResponseForPopularAPI(lastResponse, expectedParams);
    });
});


