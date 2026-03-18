## 1.How to run the test/report by your self -> run below command:
-> You need to install Node.js first
-> run this cmd to install dependencies: npm install i
-> run these commands below to get results:
run test: npx playwright test
run report: npx playwright show-report
## 2.An approach on how you would proceed with this suite integration on CI
+ run it on local machine -> can use Jenkins
+ run it on cloud - > can use Github Action/ GitLab/ EC2 on AWS
+ run it with device farm(mobile testing) -> using Browser Stack/ Lamda test
-> how to setup:
+ create the jenkins file if using Jenkins or *.yml file if use other platforms in your repository
+ in that file, setup the configuration based on their document -> it will automatically download all neccessary dependencies to set up the eviroment -> send artifacts and reports to Slack or Email or on itself platform
+NOTE: some cloud platform need to pay to use it
-> how to trigger the test on CI -> 4 main flows as below:
+ trigger by cron job
+ trigger by github events (push/merge, etc on specific branch)
+ trigger by webhook (jira)
+ trigger manually

##  What is your testing strategy?
-> My testing strategy focuses on risk-based testing. I prioritize critical user flows such as filtering, searching, and navigation. I also cover both positive and negative scenarios, and validate UI, API, and edge cases.
## Which cases did you generate? And why?
- Verify the filtering feature
- Verify the category feature
- Verify the search feature
- Verify the combination of category, search, filter feature
- Verify the pagination feature
- Verify that after refreshing the page should see page not found
- Verify that after redirecting the page directly by URL should see page not found
- Verify that user should see the No Results found message when searching with invalid data
- Verify that FE send correct data on their API based on selected filters and its data reponse returned correctly'
I created test cases for filtering by type, genre, year, and rating, including combinations of these filters. I also covered edge cases like empty results. These cases ensure both functionality and robustness of the system.
## Information about the test automation framework (libraries used etc.)
I used Playwright with TypeScript. The framework follows Page Object Model to separate test logic and UI interactions. I also use built-in features like fixtures, auto-waiting, and parallel execution. Reports are generated using HTML Reporters
## Explanation about how to run tests in your framework.
- Can run the whole test -> npx playwright test
- can run the specific test file -> npx playwright test discover.spec.ts
- can run the specific test cases -> npx playwright test -g "Verify the navigation by URL work properly"
- can run test with headless/headed -> npx playwright test --headed
- can run test in paralell -> npx playwright test --workers=4
- can run test with different browsers/devices[run test on mobile browsers] -> npx playwright test --project=chromium npx playwright test --project="iPhone 12"
- show report -> npx playwright show-report
## Which test design techniques did you use?
- I used boundary value analysis and equivalence partitioning
## What patterns did you use while coding?
- I used Page Object Model to improve maintainability and reusability. I also used fixtures to manage test setup and dependency injection. Additionally, I applied modular design to separate test data and test logic
## Which defects did you find?
-> beyond the ones that you mentioned on Assignment, i also find some new bugs
- after searching the movie name -> the selected Genre is reset to default
- some moive images are NOT displayed in the page
- after selecting Type -> the selected Genre is reset to default
- selected value on UI is not the same IN api calling, e.g select FROM 2025 and TO 2025 -> but on api call, FE sends FROM 2025 and TO 2026

## 3.For the list of resulting that on Discover page, how we can verify it throughoutly
-> UI only show the result from BE, so we need to verify 2 things
+ Check whether the FE send data correctly via corresponding api. (spy on api to verify the params and payload)
+ check whether the response returns correct json string with expected data. (spy on api to get response)
+ in some cases you can intercept/mocking api

## 4.ANOTHER APPROACH TO TEST THIS FUNCTION
-> should control the test data via Database to know which one should be returned, then automate the scripts and do assertion easily
