import React, { useState } from "react";
import AdminShell from "./AdminShell";
import { Pagination, usePaged } from "../../components/Pagination";
import { useFetch } from "../../hooks/useSeva";
import { useCategories } from "../../context/CategoriesContext";
import {
  createDbCategory,
  createDbSubcategory,
  deleteDbCategory,
  deleteDbSubcategory,
  fetchDbCategories,
  fetchDbSubcategories,
} from "../../utils/storage";
import "./Admin.css";

/* =========================================================
   ADMIN - CATEGORIES
   Add or remove donation categories and their subcategories.
   These feed the "category" dropdown on the donor's create-
   donation form once it reads from the database.
   ========================================================= */

function AdminCategories() {
  const { refresh: refreshCategoryCache } = useCategories();

  const { data: fetchedCategories, refresh: reloadCategories } = useFetch(
    fetchDbCategories,
    []
  );
  const { data: fetchedSubcategories, refresh: reloadSubcategories } =
    useFetch(() => fetchDbSubcategories(), []);

  /* After any change, also refresh the app-wide list that the donor form uses. */
  const refreshCategories = () => {
    reloadCategories();
    refreshCategoryCache();
  };
  const refreshSubcategories = () => {
    reloadSubcategories();
    refreshCategoryCache();
  };

  const categories = fetchedCategories || [];
  const subcategories = fetchedSubcategories || [];

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [error, setError] = useState("");

  const [subcatDrafts, setSubcatDrafts] = useState({});

  const paged = usePaged(categories, 10);

  const refreshAll = () => {
    refreshCategories();
    refreshSubcategories();
  };

  const handleAddCategory = async (event) => {
    event.preventDefault();
    setError("");

    if (!newCategoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    setSavingCategory(true);
    const result = await createDbCategory({
      name: newCategoryName,
      icon: newCategoryIcon,
    });
    setSavingCategory(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setNewCategoryName("");
    setNewCategoryIcon("");
    refreshCategories();
  };

  const handleDeleteCategory = async (category) => {
    if (
      !window.confirm(
        `Delete category "${category.name}"? It must have no subcategories left under it.`
      )
    ) {
      return;
    }

    const result = await deleteDbCategory(category.id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    refreshAll();
  };

  const handleAddSubcategory = async (categoryId) => {
    const name = (subcatDrafts[categoryId] || "").trim();
    if (!name) return;

    const result = await createDbSubcategory({ name, category: categoryId });
    if (!result.ok) {
      alert(result.error);
      return;
    }

    setSubcatDrafts((drafts) => ({ ...drafts, [categoryId]: "" }));
    refreshSubcategories();
  };

  const handleDeleteSubcategory = async (subcategory) => {
    if (!window.confirm(`Delete "${subcategory.name}"?`)) return;

    const result = await deleteDbSubcategory(subcategory.id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    refreshSubcategories();
  };

  return (
    <AdminShell
      title="Categories"
      subtitle={`${categories.length} categor${
        categories.length === 1 ? "y" : "ies"
      } · ${subcategories.length} subcategor${
        subcategories.length === 1 ? "y" : "ies"
      }`}
    >
      {error ? <div className="sv-alert sv-alert-error">{error}</div> : null}

      <form
        onSubmit={handleAddCategory}
        className="ngo-filters"
        style={{ marginBottom: 20 }}
      >
        <input
          type="text"
          placeholder="New category name (e.g. Sports Gear)"
          value={newCategoryName}
          onChange={(event) => setNewCategoryName(event.target.value)}
        />
        <input
          type="text"
          placeholder="Icon (emoji, optional)"
          value={newCategoryIcon}
          onChange={(event) => setNewCategoryIcon(event.target.value)}
          style={{ maxWidth: 140 }}
        />
        <button
          type="submit"
          className="sv-btn sv-btn-primary sv-btn-sm"
          disabled={savingCategory}
        >
          {savingCategory ? "Adding..." : "Add category"}
        </button>
      </form>

      {categories.length === 0 ? (
        <div className="sv-empty">
          <div className="sv-empty-icon">🏷</div>
          <h3>No categories yet</h3>
          <p>
            Add one above, or run <code>npm run seed:categories</code> in the
            backend folder to load the standard set.
          </p>
        </div>
      ) : (
        <>
          <div className="sv-table-wrap">
            <table className="sv-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Subcategories</th>
                  <th>Add subcategory</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paged.pageItems.map((category) => {
                  const items = subcategories.filter(
                    (sub) => sub.categoryId === category.id
                  );

                  return (
                    <tr key={category.id}>
                      <td style={{ minWidth: 170 }}>
                        <strong>
                          {category.icon ? `${category.icon} ` : ""}
                          {category.name}
                        </strong>
                        <br />
                        <small className="admin-muted">
                          {items.length} subcategor
                          {items.length === 1 ? "y" : "ies"}
                        </small>
                      </td>

                      <td style={{ minWidth: 260 }}>
                        <div className="sv-dcard-meta">
                          {items.map((item) => (
                            <span className="sv-chip" key={item.id}>
                              {item.name}
                              <button
                                type="button"
                                onClick={() => handleDeleteSubcategory(item)}
                                style={{
                                  marginLeft: 6,
                                  border: "none",
                                  background: "none",
                                  cursor: "pointer",
                                  color: "inherit",
                                }}
                                title="Delete subcategory"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                          {items.length === 0 ? (
                            <small className="admin-muted">
                              No subcategories yet
                            </small>
                          ) : null}
                        </div>
                      </td>

                      <td style={{ minWidth: 230 }}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="text"
                            placeholder="New subcategory"
                            value={subcatDrafts[category.id] || ""}
                            onChange={(event) =>
                              setSubcatDrafts((drafts) => ({
                                ...drafts,
                                [category.id]: event.target.value,
                              }))
                            }
                            style={{ flex: 1 }}
                          />
                          <button
                            type="button"
                            className="sv-btn sv-btn-sm"
                            onClick={() => handleAddSubcategory(category.id)}
                          >
                            Add
                          </button>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="sv-btn sv-btn-ghost sv-btn-sm"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination paged={paged} />
        </>
      )}
    </AdminShell>
  );
}

export default AdminCategories;
