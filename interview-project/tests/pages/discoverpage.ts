import { Page, expect } from '@playwright/test';
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
        await this.page.waitForLoadState("networkidle");
    }

    public async pagination(type: string) {
        logger.info("pagination :" + type)
        await this.page.locator(this.locatorPaginationType(type)).click();
        if (type !== "Previous") {
            await expect(this.page.locator(this.svg_loadingIcon)).toBeVisible();
        }
        await this.page.waitForLoadState("networkidle");
    }

    public async verifyTheNumberOfMoviesReturned(numberOfReturn: number) {
        await expect(this.page.locator(this.div_resultSection)).toHaveCount(numberOfReturn);
    }

    public async verifyTheNameOfMoviesReturned(nameOfMovies: string) {
        await expect(this.page.locator(this.p_movieName)).toHaveText(nameOfMovies);
    }

    public async verifyTheNoResultsFoundPage(message: string) {
        await expect(this.page.locator(this.div_NoResultsFound)).toHaveText(message);
    }

    public async verifyThepageNotFoundAppear() {
        await expect(this.page.locator(this.h1_pageNotFound)).toHaveText("page not found")
    }

}