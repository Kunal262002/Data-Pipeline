import { createContext, useContext, useReducer } from "react";
import * as api from "../api/client.js";

const DataContext = createContext(null);

const initialState = {
  records: [],
  stats: null,
  total: 0,
  loading: false,
  error: null,
  lastIngest: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "SET_RECORDS":
      return {
        ...state,
        records: action.records,
        total: action.total ?? action.records.length,
        loading: false,
        error: null,
      };
    case "SET_STATS":
      return { ...state, stats: action.stats, loading: false, error: null };
    case "INGESTED":
      return {
        ...state,
        total: action.total,
        lastIngest: {
          count: action.ingested,
          source: action.source,
          at: new Date().toISOString(),
        },
        loading: false,
        error: null,
      };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.error };
    case "CLEARED":
      return { ...initialState };
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function refresh() {
    dispatch({ type: "FETCH_START" });
    try {
      const [dataResp, statsResp] = await Promise.all([
        api.fetchAllData(),
        api.fetchStats(),
      ]);
      dispatch({ type: "SET_RECORDS", records: dataResp.data, total: dataResp.total });
      dispatch({ type: "SET_STATS", stats: statsResp.data });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        error: err?.response?.data?.error || err.message,
      });
    }
  }

  async function ingest(kind, body) {
    dispatch({ type: "FETCH_START" });
    try {
      const resp = await api[`ingest${kind}`](body);
      dispatch({
        type: "INGESTED",
        total: resp.total_records,
        ingested: resp.ingested,
        source: kind.toLowerCase(),
      });
      await refresh();
      return resp;
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        error: err?.response?.data?.error || err.message,
      });
      throw err;
    }
  }

  async function clear() {
    try {
      await api.clearAllData();
      dispatch({ type: "CLEARED" });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        error: err?.response?.data?.error || err.message,
      });
    }
  }

  const value = { ...state, refresh, ingest, clear };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
