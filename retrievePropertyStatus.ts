import fs from "fs";
import { parse } from "csv-parse";

const propertyToQuery = process.argv[2];

if (!propertyToQuery) {
  console.error("Missing property ID argument.");
  process.exit(1);
}

const STATUS = {
  VACANT: "PROPERTY_VACANT",
  PARTIAL: "PARTIALLY_VACANT",
  ACTIVE: "PROPERTY_ACTIVE",
  OVERDUE: "PROPERTY_OVERDUE",
};

interface Property {
  id: string;
  capacity: number;
}

interface Tenant {
  propertyId: string;
  tenancyEndDate: string;
}

const propertiesFilePath =
  "./technical-challenge-properties-september-2024.csv";
const tenantsFilePath = "./technical-challenge-tenants-september-2024.csv";

/**
 * Loads properties from CSV.
 * @returns {Promise<Record<string, Property>>} A promise that resolves to a map of property.
 */
const loadProperties = async (): Promise<Record<string, Property>> => {
  const properties: Record<string, Property> = {};

  const parser = fs
    .createReadStream(propertiesFilePath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const row of parser) {
    const { id, capacity } = row;
    const capacityNum = Number(capacity); // Originally a string, so convert

    if (!id || isNaN(capacityNum)) {
      continue;
    }

    properties[id] = {
      id: id,
      capacity: capacityNum,
    };
  }

  return properties;
};

/**
 * Loads tenants from CSV.
 * @returns {Promise<Tenant[]>} A promise that resolves to an array of Tenant objects.
 */
const loadTenants = async (): Promise<Tenant[]> => {
  const tenants: Tenant[] = [];

  const parser = fs
    .createReadStream(tenantsFilePath)
    .pipe(parse({ columns: true, trim: true }));

  for await (const row of parser) {
    const { propertyId, tenancyEndDate } = row;

    tenants.push({
      propertyId: propertyId,
      tenancyEndDate: tenancyEndDate,
    });
  }

  return tenants;
};

/**
 * Determines the status of a property based on tenants, capacity, and tenancy end dates.
 * @param {string} propertyId - The ID of the property.
 * @returns {Promise<string>} A promise that resolves to the property status.
 */
const getPropertyStatus = async (propertyId: string): Promise<string> => {
  const properties = await loadProperties();
  const tenants = await loadTenants();

  if (!properties[propertyId]) {
    throw new Error(`Property ID '${propertyId}' not found.`);
  }

  const { capacity } = properties[propertyId];
  const propertyTenants = tenants.filter(
    (tenant) => tenant.propertyId === propertyId
  );

  if (propertyTenants.length === 0) {
    return STATUS.VACANT;
  }

  const currentDate = new Date();

  const isOverdue = propertyTenants.some(
    (tenant) => new Date(tenant.tenancyEndDate) < currentDate
  );

  if (isOverdue) {
    return STATUS.OVERDUE;
  }

  return propertyTenants.length < capacity ? STATUS.VACANT : STATUS.ACTIVE;
};

(async () => {
  try {
    const status = await getPropertyStatus(propertyToQuery);
    console.log(status);
    return status;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
