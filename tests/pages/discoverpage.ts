import { Page, expect, Response } from '@playwright/test';
import logger from "../logger/logger";
import { generateKey } from 'node:crypto';


export class DiscoverPage {
    constructor(private page: Page) { }
    private commonLocatorFilter: string = "//aside//*[contains(@class,'menu')]/div/div";
    private li_ratings: string = "//ul[@role='radiogroup']/li";
    private input_search: string = "//input[@name='search']";
    private div_resultSection: string = "//*[contains(@class,'overflow-scroll')]/div/div";
    private p_movieName: string = "//*[contains(@class,'overflow-scroll')]//p[contains(@class,'text-blue')]";
    private h1_pageNotFound: string = "//*[@class='content']//h1";
    private svg_loadingIcon: string = "//*[contains(@aria-label,'audio-loading')]";
    private div_NoResultsFound: string = "//*[contains(@class,'justify-center')]";
    private div_pagination: string = "//*[@id='react-paginate']//ul//li";


    private locatorCategory(category: string) {
        return `//header//a[text()='${category}']`;
    }
    private locatorPaginationType(type: string) {
        return `//a[contains(text(),'${type}')]`;
    }

    private locatorField(optionName: string) {
        return `//p[contains(text(),'${optionName}')]//following-sibling::div`;
    }

    public async filterMovie(filterOption: {
        type: string,
        genre: string[],
        yearFrom: string,
        yearTo: string,
        rating: number,
    }) {
        logger.info("Starting filter movie with the criteria: " + JSON.stringify(filterOption, null, 2))

        //select type
        await this.page.locator(this.locatorField("Type")).first().click();
        await this.page.locator(this.commonLocatorFilter).filter({ hasText: filterOption.type }).click();
        //select genre
        for (const genre of filterOption.genre) {
            await this.page.locator(this.locatorField("Genre")).first().click();
            await this.page
                .locator(this.commonLocatorFilter)
                .filter({ hasText: genre })
                .click();
        }
        //select from year
        await this.page.locator(this.locatorField("Year")).first().locator("> div").first().click();
        await this.page.locator(this.commonLocatorFilter).filter({ hasText: filterOption.yearFrom }).click();
        //select to year
        await this.page.locator(this.locatorField("Year")).first().locator("> div").last().click();
        await this.page.locator(this.commonLocatorFilter).filter({ hasText: filterOption.yearTo }).click();
        //select ratings 
        const star = this.page.locator(this.li_ratings).nth(filterOption.rating - 1);
        const box = await star.boundingBox();
        //handling to select the right half part of Ratings to make sure that we dont accidentially click an half star
        if (!box) return;
        await star.click(
            {
                position: {
                    x: box.width * 0.7,
                    y: box.height * 0.5
                }
            }
        );
        //wait for the page loaded
        await this.page.waitForLoadState("networkidle");

    }

    public async selectCategory(name: string) {
        logger.info("selecting category:" + name)
        await this.page.locator(this.locatorCategory(name)).click();
        await this.page.waitForLoadState("networkidle");
    }

    public async searchMovie(name: string) {
        logger.info("searching movie name:" + name)
        await this.page.locator(this.input_search).fill(name);
        await this.page.waitForLoadState("networkidle")
    }

    public async pagination(type?: string) {
        logger.info("pagination :" + type)
        if (type !== "Previous" && type !== "Next") {
            const items = this.page.locator(this.div_pagination);
            const count = await items.count();
            await items.nth(count - 2).click();
        } else {
            await this.page.locator(this.locatorPaginationType(type)).click();
        }
        if (type !== "Previous") {
            await expect(this.page.locator(this.svg_loadingIcon)).toBeVisible();
        }
    }

    public async waitForLoadingIcon() {
        await expect(this.page.locator(this.svg_loadingIcon)).toBeVisible();
    }

    public async verifyTheNumberOfMoviesReturned(numberOfReturn: number) {
        await expect(this.page.locator(this.div_resultSection)).toHaveCount(numberOfReturn);
    }

    public async verifyTheNameOfMoviesReturned(nameOfMovies: string) {
        await expect(this.page.locator(this.p_movieName)).toHaveText(nameOfMovies);
    }

    public async verifyTheNoResultsFoundAppear(message: string) {
        await expect(this.page.locator(this.div_NoResultsFound)).toHaveText(message);
    }

    public async verifyThepageNotFoundAppear() {
        await expect(this.page.locator(this.h1_pageNotFound)).toHaveText("page not found")
    }

    public async verifyTheParams(url: URL, params: {
        sort_by: string,
        "release_date.gte": string,
        "release_date.lte": string,
        "vote_average.gte": string,
        "vote_average.lte": string,
        page: string,
        with_genres: string,
        api_key: string
    }) {
        logger.info("Verifying the below params: " + JSON.stringify(params, null, 2))
        expect.soft(url.searchParams.get("sort_by")).toEqual(params.sort_by);
        expect.soft(url.searchParams.get("release_date.gte")).toEqual(params['release_date.gte']);
        expect.soft(url.searchParams.get("release_date.lte")).toEqual(params['release_date.lte']);
        expect.soft(url.searchParams.get("vote_average.gte")).toEqual(params['vote_average.gte']);
        expect.soft(url.searchParams.get("vote_average.lte")).toEqual(params['vote_average.lte']);
        expect.soft(url.searchParams.get("page")).toEqual(params.page);
        expect.soft(url.searchParams.get("with_genres")).toEqual(params.with_genres);
        expect.soft(url.searchParams.get("api_key")).toEqual(params.api_key);
    }

    public async verifyTheResponseForPopularAPI(response: Response, params: {
        sort_by: string,
        "release_date.gte": string,
        "release_date.lte": string,
        "vote_average.gte": string,
        "vote_average.lte": string,
        page: string,
        with_genres: string,
        api_key: string
    }) {
        const body = await response.json();
        const results = body.results;
        logger.info("Verifying the below response: " + JSON.stringify(body, null, 2))
        //verify the page number
        expect.soft(body.page).toEqual(parseInt(params.page));

        for (let result of results) {
            //verify the vote range
            expect.soft(result.vote_average).toBeGreaterThanOrEqual(parseFloat(params["vote_average.gte"]))
            expect.soft(result.vote_average).toBeLessThanOrEqual(parseFloat(params["vote_average.lte"]))
            //verify the genre list
            const expectedGenre = params.with_genres.split(",").map(Number);
            const actualGenre = result.genre_ids;
            expectedGenre.forEach(value => {
                expect.soft(actualGenre).toContain(value);
            })

        }
    }

}