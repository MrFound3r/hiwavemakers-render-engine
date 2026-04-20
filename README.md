# Configure environment

For the app to work you need NodeJs, MySQL and disable a setting in Chrome

## Install dependencies

1. In the root folder look for "run-build.bat". This has to be done just the first time.

2. Double click on the file and wait for the servers to run

3. Wait for the file to run

## Set up database

1. Install MySQL in the computer or Xampp

2. Look for the file in "packages/db/schema.sql"

3. Run the query to create the database and its tables

## Configure Chrome

1. Open up Google Chrome

2. In the search bar open up the following URL

        chrome://flags/#local-network-access-check

3. In the dropdown select "Disabled"

4. Restart the browser

## Start the app

1. In the root folder look for "run-build.bat". This has to be done just the first time.

2. In the root folder look for "run-start.bat".

3. Double click on the file and wait for the servers to run

## Render videos

1. Start the servers

2. Go to "localhost:3000" in your browser

3. Select the class

4. You will see each student that has recordings

5. Click on "Render"

6. Wait a few minutes and "Refresh the status" to see if the videos where correctly rendered
