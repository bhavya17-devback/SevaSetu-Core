/* =========================================================
   CATEGORIES CONTEXT
   ---------------------------------------------------------
   Loads the category + subcategory list from the database so
   anything an admin adds (or removes) shows up for donors and
   NGOs. If the server can't be reached - or nothing has been
   seeded yet - the built-in list is used instead.
   ========================================================= */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getAllCategories,
  mergeDbCategories,
  registerCategories,
} from "../utils/categories";
import { fetchDbCategories, fetchDbSubcategories } from "../utils/storage";

const CategoriesContext = createContext(null);

export function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState(() => getAllCategories());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [dbCategories, dbSubcategories] = await Promise.all([
        fetchDbCategories(),
        fetchDbSubcategories(),
      ]);

      const merged = mergeDbCategories(dbCategories, dbSubcategories);

      /* Register first so getCategory() is already up to date when
         the screens re-render with the new list. */
      registerCategories(merged);
      setCategories(merged);
    } catch (error) {
      /* Keep whatever list we already have. */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CategoriesContext.Provider value={{ categories, loading, refresh }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used inside <CategoriesProvider>");
  }
  return context;
}
