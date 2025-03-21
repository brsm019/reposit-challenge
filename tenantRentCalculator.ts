import fs from "fs";
import { parse } from "csv-parse";

// Retrieve property ID and currency type from command line arguments
const propertyToQuery: string | undefined = process.argv[2];
const currency: string | undefined = process.argv[3]?.toLowerCase();

const PRICE = {
    POUNDS: "pounds",
    PENCE: "pence",
  };

if (!propertyToQuery) {
  console.error("Missing property argument.");
  process.exit(1);
}

if (currency !== PRICE.PENCE && currency !== PRICE.POUNDS) {
  console.error("Missing pence or pound argument.");
  process.exit(1);
}

interface PropertyData {
  id: string;
  monthlyRentPence: string;
}

interface TenantData {
  propertyId: string;
  name: string;
}

// Data stores
const propertyData: Record<string, number> = {};
const tenantCounts: Record<string, number> = {};

const propertiesFilePath =
  "./technical-challenge-properties-september-2024.csv";
const tenantsFilePath = "./technical-challenge-tenants-september-2024.csv";

/**
 * Loads properties from CSV.
 * @returns {Promise<Record<string, number>>} A promise that resolves to a map of property ID -> rent in pence.
 */
const loadProperties = async (): Promise<void> => {
  const parser = fs
    .createReadStream(propertiesFilePath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const row of parser) {
    const { id, monthlyRentPence } = row as PropertyData;
    if (!id || !monthlyRentPence) continue;

    const rent = Number(monthlyRentPence);
    propertyData[row.id] = rent;
  }
};

/**
 * Loads tenants from CSV asynchronously.
 * @returns {Promise<void>} A promise that resolves after processing tenants.
 */
const loadTenants = async (): Promise<void> => {
  const parser = fs
    .createReadStream(tenantsFilePath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const row of parser) {
    const { propertyId } = row as TenantData;
    tenantCounts[propertyId] = (tenantCounts[propertyId] || 0) + 1; // Count tenants by property ID
  }
};

/**
 * Calculates the rent per tenant for a given property.
 * @returns {Promise<number>} A promise that resolves to the rent per tenant in either pence or pounds.
 */
const calculateRentPerTenant = async (): Promise<number> => {
  // Load property and tenant data
  await loadProperties();
  await loadTenants();

  // Check if data for the given property exists
  if (!(propertyToQuery in propertyData)) {
    throw new Error(
      `No rent data available for property ID: ${propertyToQuery}`
    );
  }

  const rent = propertyData[propertyToQuery];
  const tenantCount = tenantCounts[propertyToQuery];

  if (!tenantCount) {
    throw new Error(`No tenants found for property ID: ${propertyToQuery}`);
  }

  const rentPerTenant = rent / tenantCount;
  return currency === PRICE.POUNDS ? rentPerTenant / 100 : rentPerTenant;
};

(async () => {
  try {
    const rentPerTenant = await calculateRentPerTenant();
    console.log(
      `${rentPerTenant} ${
        currency === PRICE.POUNDS ? PRICE.POUNDS : PRICE.PENCE
      }`
    );
    return rentPerTenant;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
