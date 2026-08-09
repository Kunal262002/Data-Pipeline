import { useCallback, useEffect, useState } from "react";

/**
 * Reusable data-fetching hook.
 * @param {Function} fetcher - async function returning the unwrapped response.
 * @param {Array} deps - dependencies that trigger a refetch.
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      const message =
        err?.response?.data?.error || err?.message || "Unexpected error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: run };
}
