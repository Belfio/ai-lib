import { Builder, By, WebDriver, Browser } from "selenium-webdriver";

// Selenium function to simulate a click on the "Run All" button
function runAllCells(driver: WebDriver) {
  driver
    .findElement(
      By.xpath('//colab-run-button | //paper-icon-button[@icon="play-arrow"]')
    )
    .then((runButton) => runButton.click())
    .then(() => driver.sleep(300000)); // Wait for 5 minutes (can be adjusted)
}

// High-level function to manage the entire Colab running process with Selenium
export function runColab(colabUrl: string) {
  const driver = new Builder().forBrowser(Browser.SAFARI).build();

  return driver
    .get(colabUrl)
    .then(() => driver.sleep(5000)) // Wait for the notebook to load
    .then(() => runAllCells(driver)) // Run all cells
    .finally(() => driver.quit()); // Close the browser after execution
}

async function testModel(s3Path: string) {
  await uploadFileFromS3(s3Path);
  // .then(fileId=>"https://colab.research.google.com/drive/"+fileId)
  // .then((colabUrl: string) => {
  //   console.log("Notebook uploaded to:", colabUrl);
  //   return runColab(colabUrl); // Now run the notebook in Colab
  // })
  // .catch(console.error);
}
const ds = { testModel };
export default ds;
