# BStackDemo Playwright Tests

Playwright test suite for [BStackDemo](https://bstackdemo.com) — BrowserStack's e-commerce demo app — with a GitHub Actions workflow powered by the **BrowserStack Test Companion CLI (`tc`)**.

---

## Test suite

| File | Tests | Purpose |
|------|-------|---------|
| `tests/bstackdemo.spec.ts` | 3 | Successful checkout, locked-user failure, self-heal |

### Test descriptions

| Test | Expected outcome |
|------|-----------------|
| `successful checkout — add iPhone 12 and place order` | Logs in as `demouser`, adds iPhone 12 to cart, fills the shipping form, and asserts the confirmation page shows **"Your Order has been successfully placed."** |
| `failure — locked_user is blocked from signing in` | Attempts login with `locked_user` and asserts the error heading **"Your account has been locked."** is shown. |
| `self-heal — stale login-button selector is healed by BrowserStack` | Uses the intentionally stale selector `#login-button` (real id: `#login-btn`). Fails locally by design. When run on BrowserStack with **Self-Heal** enabled, the platform detects the broken locator, heals it at runtime, and surfaces the suggested fix in the dashboard. |

---

## Prerequisites

- Node.js 18+
- A [BrowserStack account](https://www.browserstack.com/users/sign_up) (for cloud runs and self-heal)

---

## Local setup

```bash
npm install
npx playwright install chromium
```

---

## Run tests locally

```bash
# All three tests on Chromium
npx playwright test tests/bstackdemo.spec.ts --project=chromium

# A single test by title
npx playwright test -g "successful checkout" --project=chromium
```

> **Note:** The self-heal test will time out locally — that is expected. It requires BrowserStack Self-Heal to pass.

---

## Run tests on BrowserStack

1. Add your credentials to a `.env` file (already git-ignored):

   ```
   BROWSERSTACK_USERNAME=your_username
   BROWSERSTACK_ACCESS_KEY=your_access_key
   ```

2. Run via the BrowserStack SDK:

   ```bash
   npx browserstack-node-sdk playwright test tests/bstackdemo.spec.ts
   ```

3. View results at [automate.browserstack.com](https://automate.browserstack.com).

---

## CI/CD — GitHub Actions

The workflow at `.github/workflows/browserstack-test-companion.yml` uses the **BrowserStack Test Companion CLI (`tc`)** to automate test generation and automation on every PR merge.

### Triggers

| Event | What runs |
|-------|-----------|
| Pull request targeting `main` (merged) | Generate test cases → Automate them |
| Manual dispatch (`workflow_dispatch`) | Run the full test suite on BrowserStack |

### Pipeline steps (on PR merge)

```
PR merged into main
       │
       ▼
tc workflow run generate   ← generates test cases, saves to Test Management
       │
       ▼
tc workflow run automate   ← turns TM cases into automated scripts, opens a PR
```

### Required repository secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Where to find it |
|--------|-----------------|
| `BROWSERSTACK_USERNAME` | [Account & Profile](https://www.browserstack.com/accounts/profile/details) |
| `BROWSERSTACK_ACCESS_KEY` | [Account & Profile](https://www.browserstack.com/accounts/profile/details) |

### Pin the CLI version

In `.github/workflows/browserstack-test-companion.yml`, replace the placeholders:

```yaml
TC_PIN_VERSION: "<version>"   # e.g. 1.1.2
TC_SHA256: "<sha256>"         # checksum for ubuntu-latest (x86_64)
```

Find the latest version and checksums on the [tc release page](https://test-companion.browserstack.com/cli/releases).

### Pipeline configuration file

Commit `testcompanion-pipeline.yml` to the repository root to map events to workflows:

```yaml
workflows:
  - name: generate-on-merge
    workflow: generate
    on: pr_merged
    when: { branches: [main] }
    input: { save-to-tm: "true" }
    mode: preview          # remove this line when ready to write for real
    limits: { time: 15m, cost_usd: 5 }
    enabled: true

  - name: automate-on-merge
    workflow: automate
    on: pr_merged
    when: { branches: [main] }
    limits: { time: 20m, cost_usd: 8 }
    enabled: true
```

> Start with `mode: preview` to review runs before they open pull requests or push references.

### Artifacts

Each run uploads a `tc-summaries` artifact containing:

- `tc-generate-summary.md` — outcome of the generate workflow
- `tc-automate-summary.md` — outcome of the automate workflow
- `tc-summary.md` — outcome of the test workflow (manual dispatch)

Summaries are also appended to the GitHub Actions job summary for quick review.

---

## Project structure

```
.
├── .github/
│   └── workflows/
│       └── browserstack-test-companion.yml   # CI/CD workflow
├── tests/
│   ├── example.spec.ts                       # Playwright sample tests
│   └── bstackdemo.spec.ts                    # BStackDemo tests (this suite)
├── testcompanion-pipeline.yml                # tc event → workflow bindings
├── playwright.config.ts
└── README.md
```

---

## References

- [BrowserStack Test Companion — CI pipelines](https://www.browserstack.com/docs/test-companion/get-started/cli/ci-pipelines)
- [BrowserStack Test Companion — CLI command reference](https://www.browserstack.com/docs/test-companion/get-started/cli/command-reference)
- [BrowserStack Automate — Playwright](https://www.browserstack.com/docs/automate/playwright)
- [BStackDemo](https://bstackdemo.com)
