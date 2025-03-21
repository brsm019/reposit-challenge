import fs from "fs";
import { parse } from "csv-parse";

// Retrieve region from command line
const regionToQuery: string | undefined = process.argv[2];

if (!regionToQuery) {
  console.error("Missing region argument.");
  process.exit(1);
}

interface PropertyData {
  region: string;
  monthlyRentPence: string;
}

interface RegionData {
  total: number;
  count: number;
}

const regionData: Record<string, RegionData> = {};

const tenantsFilePath = "./technical-challenge-properties-september-2024.csv";

/**
 * Loads properties CSV file and processes rows.
 */
const loadProperties = async (): Promise<void> => {
  const parser = fs
    .createReadStream(tenantsFilePath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const row of parser) {
    processRow(row as PropertyData);
  }
};

/**
 * Processes a CSV row and aggregates rent data.
 */
const processRow = ({ region, monthlyRentPence }: PropertyData): void => {
  if (!region || !monthlyRentPence) return;

  const rent = Number(monthlyRentPence);
  if (isNaN(rent)) return;

  const normalizedRegion = region.trim().toUpperCase();

  if (!regionData[normalizedRegion]) {
    regionData[normalizedRegion] = { total: 0, count: 0 };
  }

  regionData[normalizedRegion].total += rent;
  regionData[normalizedRegion].count++;
};

/**
 * Calculates average rent for the provided region.
 */
const calculateAverage = (): number => {
  const formattedRegion = regionToQuery!.trim().toUpperCase();
  const data = regionData[formattedRegion];

  if (!data) {
    console.error(`No data available for region: ${regionToQuery}`);
    process.exit(1);
  }

  return Math.round(data.total / data.count);
};

(async () => {
  try {
    await loadProperties();
    const average = calculateAverage();
    console.log(average);
    return average;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
