# SevaSetu — what changed in this update

## 1. The registration / refresh bug (root cause)

Your project had **two different data layers running side by side**:

* `src/utils/storage.js` + `src/hooks/useSeva.js` — a clean central store
* `Login.js`, `Register.js`, the donor pages and the NGO pages — each reading
  and writing its own raw `localStorage` keys (`sevasetuUsers`, `sevasetuLogin`,
  `sevasetuDonations`, `sevasetuDonations_<id>`, `sevasetuCoins_<id>` …)

Registration wrote to one set of keys, the dashboards read from another, and
every page loaded its data once inside a `useState` initialiser that never
re-ran. That is exactly why the dashboard never refreshed.

**Fix:** every screen now goes through `src/utils/storage.js` only. Each write
fires a `sevasetu:update` event, and `useLive()` re-runs the selector whenever
that event, a `storage` event, or a window `focus` happens — so the UI updates
instantly, in every open tab.

Registration also now signs the new account in automatically and lands it on the
correct dashboard with its real name and details already loaded.
`migrateLegacyData()` carries any accounts saved by the old build across.

## 2. Create Donation

* The **donation image field is gone**. Listings are illustrated automatically
  with the NGO-style photograph attached to the chosen category
  (`src/utils/categories.js`).
* Rebuilt as a three-step form (category → item → pickup) with a visual category
  picker and a **live preview** of the card NGOs will see.
* Eight categories with curated item lists, units, conditions, pickup date and a
  contact number that is only revealed to the NGO that claims the item.

## 3. NGO side

* An NGO registers with its organisation name, registration number, focus area,
  city and address — and signs in later with **those same credentials**.
* `/ngo/dashboard` shows the organisation's own name, profile card, claims,
  donations received, awaiting-pickup list and impact summary.
* Browse screen filters by search / category / city; claiming unlocks the
  donor's phone, email and pickup address; "Mark collected" closes the loop and
  the donor sees it as *Delivered* immediately.

## 4. Admin panel (new, reachable from the footer)

An **Admin** link now sits in the footer bottom bar → `/admin/login`.

Demo credentials (change them in `src/utils/storage.js` before deploying):

```
admin@sevasetu.in / admin@123
```

The panel has three screens:

* **Overview** — donors, NGOs, totals, completion rate, donation pipeline,
  most-donated categories, newest accounts, latest donations
* **Users** — search/filter every donor and NGO, suspend (blocks login) or
  delete an account
* **Donations** — every listing on the platform, filter by status, unlist or
  delete

## 5. Homepage, logo and design system

* New landing page: hero with layered photography and floating live stats, a
  live stats strip, a three-step "how it works" section with imagery, an
  eight-category gallery, an NGO band and a closing call to action.
* **Logo**: a bridge (*setu*) carrying a heart, with a node on each bank — the
  donor on one side, the NGO on the other. It lives in
  `src/components/Logo.js` as an inline SVG (crisp at any size, theme-aware) and
  as `public/logo.svg`, which is also the favicon.
* Everything is built on `src/styles/theme.css` — one saffron/teal token set,
  buttons, cards, badges, tables, sidebar, forms and empty states — so the
  donor, NGO and admin areas all look like one product.

## Files removed

`components/Button.js`, `Modal.js`, `DonationCard.js` (all empty),
`DonorSidebar.js/.css` (replaced by the shared `Sidebar` + `DashboardShell`),
`pages/common/Profile.js`, `ForgotPassword.js` (empty), and the old
`Login.css` / `Register.css` / per-page dashboard stylesheets.

## Running it

```
npm install
npm start
```

The build compiles with no warnings.
