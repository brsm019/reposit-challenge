import fs from "fs";
import { parse } from "csv-parse";

interface PropertyData {
  id: string;
  postcode: string;
}

const propertiesFilePath =
  "./technical-challenge-properties-september-2024.csv";

// Regex to validate UK postcode
const postcodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i;

/**
 * Loads properties from CSV and collects property IDs with invalid or missing postcodes.
 *
 * @returns {Promise<string[]>} A promise that resolves to an array of invalid postcodes.
 */
const generateInvalidPostcodes = async (): Promise<string[]> => {
  const invalidPostcodeProperties: string[] = [];

  const parser = fs
    .createReadStream(propertiesFilePath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const row of parser) {
    const { id, postcode } = row as PropertyData;
    if (!postcode || !postcodeRegex.test(postcode)) {
      invalidPostcodeProperties.push(id);
    }
  }

  return invalidPostcodeProperties;
};

(async () => {
  try {
    const invalidIds = await generateInvalidPostcodes();
    console.log(invalidIds);
    return invalidIds;
  } catch (error) {
    console.error("Error processing CSV:", error);
  }
})();
