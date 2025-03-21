# reposit-challenge

A project containing multiple TypeScript utilities to process tenancy and property data from CSV files.

---

## Setup

Ensure you're using **Node.js v18.17.0**.

```bash
nvm use
```

Then install all dependencies:

```bash
npm install
```

---

## Scripts

Each script can be run using `npx tsx`:

---

### 1. Calculate Average Rent by Region (in pence)

**File:** `rentCalculator.ts`

**Usage:**

```bash
npx tsx rentCalculator.ts "<REGION>"
```

**Example:**

```bash
npx tsx rentCalculator.ts "ENGLAND"
```

---

### 2. Calculate Rent Per Tenant for a Property

**File:** `tenantRentCalculator.ts`

**Usage:**

```bash
npx tsx tenantRentCalculator.ts <PROPERTY_ID> <pounds|pence>
```

**Example:**

```bash
npx tsx tenantRentCalculator.ts "p_1008" pence
```

---

### 3. Retrieve Property Status -> `ACTIVE`, `VACANT`, `PARTIALLY VACANT` or `OVERDUE`.

**File:** `retrievePropertyStatus.ts`

**Usage:**

```bash
npx tsx retrievePropertyStatus.ts <PROPERTY_ID>
```

**Example:**

```bash
npx tsx retrievePropertyStatus.ts "p_1025"
```

---

### 4. Validate Postcodes

**File:** `validatePostcodes.ts`

**Usage:**

```bash
npx tsx validatePostcodes.ts
```
