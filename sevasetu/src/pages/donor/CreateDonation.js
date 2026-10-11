import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import CoverImage from "../../components/CoverImage";
import { useAuthUser } from "../../hooks/useSeva";
import { DONOR_MENU } from "./donorMenu";
import { CONDITIONS, UNITS, getCategory } from "../../utils/categories";
import { useCategories } from "../../context/CategoriesContext";
import {
  COINS_PER_DONATION,
  createDonation,
  formatDate,
} from "../../utils/storage";
import "./Donor.css";

/* =========================================================
   CREATE DONATION
   ---------------------------------------------------------
   There is no image upload any more. Every listing is
   illustrated with the NGO-style photograph that belongs to
   the category the donor picks, so the whole platform looks
   consistent and nobody has to find a photo first.
   ========================================================= */

/* Donors can only schedule a pickup from today up to 2 weeks ahead. */
const MAX_PICKUP_DAYS = 14;

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPickupRange = () => {
  const today = new Date();
  const last = new Date();
  last.setDate(today.getDate() + MAX_PICKUP_DAYS);
  return { min: toInputDate(today), max: toInputDate(last) };
};

const EMPTY = {
  category: "",
  itemName: "",
  customItem: "",
  quantity: "1",
  unit: "Items",
  condition: "Gently Used",
  description: "",
  city: "",
  address: "",
  pickupDate: "",
  contactPhone: "",
};

function CreateDonation() {
  const navigate = useNavigate();
  const user = useAuthUser("donor");
  const { categories, refresh: refreshCategories } = useCategories();

  /* Pull the latest list every time this page opens, so a category an
     admin just added is here without reloading the website. */
  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const { min: minPickup, max: maxPickup } = getPickupRange();

  const meta = form.category ? getCategory(form.category) : null;
  const items = meta ? meta.items : [];

  /* A category with no subcategories yet: the donor just types the item. */
  const noItems = Boolean(meta) && items.length === 0;

  const isCustom =
    noItems ||
    (form.itemName.toLowerCase().startsWith("other") && form.itemName !== "");

  const update = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    setError("");
  };

  const pickCategory = (id) => {
    setForm((previous) => ({
      ...previous,
      category: id,
      itemName: "",
      customItem: "",
    }));
    setError("");
  };

  const finalItemName = isCustom ? form.customItem.trim() : form.itemName;

  /* ================= SUBMIT ================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.category) {
      setError("Please choose a donation category.");
      return;
    }

    if (!finalItemName) {
      setError("Please choose or type what you are donating.");
      return;
    }

    if (!form.quantity || Number(form.quantity) < 1) {
      setError("Please enter a quantity of at least 1.");
      return;
    }

    if (!form.city.trim()) {
      setError("Please enter the city the item can be collected from.");
      return;
    }

    if (!form.address.trim()) {
      setError("Please enter a pickup address so the NGO can reach you.");
      return;
    }

    if (
      form.pickupDate &&
      (form.pickupDate < minPickup || form.pickupDate > maxPickup)
    ) {
      setError(
        `Pickup date must be within the next ${MAX_PICKUP_DAYS} days (${formatDate(
          minPickup
        )} – ${formatDate(maxPickup)}).`
      );
      return;
    }

    const phone = String(form.contactPhone || user.phone || "").trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please provide a valid 10-digit contact number.");
      return;
    }

    setSaving(true);

    const result = await createDonation({
      ...form,
      itemName: finalItemName,
      contactPhone: phone,
    });

    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate("/donor/my-donations", { replace: true });
  };

  if (!user) return null;

  return (
    <DashboardShell
      user={user}
      menu={DONOR_MENU}
      sectionLabel="Donor menu"
      title="Create a donation"
      subtitle="Tell us what you have and where it can be collected from."
      actions={
        <button
          type="button"
          className="sv-btn sv-btn-ghost"
          onClick={() => navigate("/donor/dashboard")}
        >
          ← Back to dashboard
        </button>
      }
    >
      <div className="create-layout">
        {/* ================= FORM ================= */}

        <form className="create-form" onSubmit={handleSubmit} noValidate>
          {error ? <div className="sv-alert sv-alert-error">{error}</div> : null}

          <p className="create-step-label">
            <i>1</i> Choose a category
          </p>

          <p className="category-selected">
            {meta ? (
              <>
                Selected: <strong>{meta.icon} {meta.label}</strong>
              </>
            ) : (
              "Tap a picture below to choose what you are donating."
            )}
          </p>

          <div className="category-picker">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`category-option ${
                  form.category === category.id ? "active" : ""
                }`}
                style={{ "--tint": category.tint }}
                onClick={() => pickCategory(category.id)}
              >
                <span className="category-option-photo">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.label}
                      loading="lazy"
                    />
                  ) : (
                    <span className="category-option-emoji">{category.icon}</span>
                  )}
                </span>

                <span className="category-option-label">
                  <span className="category-option-icon">{category.icon}</span>
                  <span className="category-option-name">{category.label}</span>
                  {form.category === category.id ? (
                    <span className="category-option-check">✓</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>

          <p className="create-step-label">
            <i>2</i> What are you donating?
          </p>

          <div className="create-row">
            <div className="sv-field">
              <label htmlFor="item">Item</label>
              <select
                id="item"
                value={form.itemName}
                onChange={update("itemName")}
                disabled={!form.category || noItems}
              >
                <option value="">
                  {!form.category
                    ? "Pick a category first"
                    : noItems
                    ? "Type the item below"
                    : "Select an item"}
                </option>
                {items.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="sv-field">
              <label htmlFor="condition">Condition</label>
              <select
                id="condition"
                value={form.condition}
                onChange={update("condition")}
              >
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isCustom ? (
            <div className="sv-field" style={{ marginTop: 16 }}>
              <label htmlFor="custom">Tell us what it is</label>
              <input
                id="custom"
                type="text"
                value={form.customItem}
                onChange={update("customItem")}
                placeholder="e.g. Sewing machine"
              />
            </div>
          ) : null}

          <div className="create-row" style={{ marginTop: 16 }}>
            <div className="sv-field">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={update("quantity")}
              />
            </div>

            <div className="sv-field">
              <label htmlFor="unit">Unit</label>
              <select id="unit" value={form.unit} onChange={update("unit")}>
                {UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sv-field" style={{ marginTop: 16 }}>
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={form.description}
              onChange={update("description")}
              placeholder="Anything the NGO should know — sizes, expiry dates, whether it needs a small repair..."
            />
          </div>

          <p className="create-step-label">
            <i>3</i> Pickup details
          </p>

          <div className="create-row">
            <div className="sv-field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                value={form.city}
                onChange={update("city")}
                placeholder="e.g. Surat"
              />
            </div>

            <div className="sv-field">
              <label htmlFor="pickup">Preferred pickup date</label>
              <input
                id="pickup"
                type="date"
                min={minPickup}
                max={maxPickup}
                value={form.pickupDate}
                onChange={update("pickupDate")}
              />
              <small>
                Choose a date within the next 2 weeks (up to{" "}
                {formatDate(maxPickup)}).
              </small>
            </div>
          </div>

          <div className="sv-field" style={{ marginTop: 16 }}>
            <label htmlFor="address">Pickup address</label>
            <input
              id="address"
              type="text"
              value={form.address}
              onChange={update("address")}
              placeholder="Flat / street / area / landmark"
            />
          </div>

          <div className="sv-field" style={{ marginTop: 16 }}>
            <label htmlFor="phone">Contact number</label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={form.contactPhone || user.phone || ""}
              onChange={(event) =>
                setForm((previous) => ({
                  ...previous,
                  contactPhone: event.target.value.replace(/\D/g, "").slice(0, 10),
                }))
              }
              placeholder="10-digit mobile"
            />
            <small>Shared only with the NGO that claims this donation.</small>
          </div>

          <button
            type="submit"
            className="sv-btn sv-btn-primary"
            style={{ width: "100%", marginTop: 26 }}
            disabled={saving}
          >
            {saving ? "Publishing..." : `Publish donation · +${COINS_PER_DONATION} coins`}
          </button>
        </form>

        {/* ================= LIVE PREVIEW ================= */}

        <aside className="create-preview">
          <div className="create-preview-head">
            <strong>Live preview</strong>
            <small>This is how NGOs will see your listing</small>
          </div>

          <CoverImage category={form.category || "other"} height={168} />

          <div className="create-preview-body">
            <h3 style={{ fontSize: "1.05rem" }}>
              {finalItemName || "Your item name"}
            </h3>

            <div className="preview-rows">
              <div className="preview-row">
                <span>Category</span>
                <strong>{meta ? meta.label : "Not selected"}</strong>
              </div>

              <div className="preview-row">
                <span>Quantity</span>
                <strong>
                  {form.quantity || "—"} {form.unit}
                </strong>
              </div>

              <div className="preview-row">
                <span>Condition</span>
                <strong>{form.condition}</strong>
              </div>

              <div className="preview-row">
                <span>City</span>
                <strong>{form.city || "—"}</strong>
              </div>

              <div className="preview-row">
                <span>Donor</span>
                <strong>{user.name}</strong>
              </div>
            </div>

            <div className="create-note">
              📷 No photo needed. Every listing automatically uses the artwork
              that belongs to its category, so your donation looks the part
              straight away.
            </div>
          </div>
        </aside>
      </div>
    </DashboardShell>
  );
}

export default CreateDonation;
