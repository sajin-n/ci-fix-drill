# CI Failure Diagnosis

The initial pipeline configuration and local reproduction identified these failures:

## 1. Dependency installation

- **Step:** `Install dependencies`
- **Log message:** `npm ci can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with npm install before continuing.`
- **Cause:** `package.json` declares `lodash` under `dependencies`, but the lockfile root did not contain that dependency. A clean CI install therefore rejected the stale lockfile instead of producing a reproducible dependency tree. Running `npm install` regenerated the lockfile, and the workflow now uses `npm ci`.

## 2. Test runner availability

- **Step:** `Run tests`
- **Log message:** `jest: command not found` (local Windows reproduction: `'jest' is not recognized as an internal or external command, operable program or batch file.`)
- **Cause:** The `test` job ran on a separate fresh runner without `actions/checkout` or an install step. Its `npm test` command could not find the Jest executable in `node_modules/.bin`. The job now waits for the install job, checks out the repository, and runs `npm ci` on its own runner.

## 3. Discount unit-test assertion

- **Step:** `Run tests`, `src/payments/calculateDiscount.test.js`
- **Log message:** `Expected: 100` / `Received: 90`
- **Cause:** `calculateDiscount(100, 10)` correctly returns 90, but the test expected 100. The implementation was correct, so the test expectation was changed to 90.

## 4. Currency unit-test matcher

- **Step:** `Run tests`, `src/utils/formatCurrency.test.js`
- **Log message:** `Expected: {"amount": 10.01, "currency": "USD"}` / `Received: serializes to the same string`
- **Cause:** `toBe` checks object identity, while `formatCurrency` returns a newly created object. The assertion now uses `toEqual`, which compares the returned object's properties.