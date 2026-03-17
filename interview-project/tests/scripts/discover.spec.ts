import { test, expect } from '@playwright/test';
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
        await discoverPage.pagination("55705");
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

    test('Verify that FE send correct data on their API based on selected filters ', async ({ page }) => {
        
    });
});


