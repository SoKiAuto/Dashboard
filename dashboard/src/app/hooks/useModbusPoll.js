"use client";

import useSWR from "swr";

const fetcher = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Network error");
    return res.json();
  });

export default function useModbusPoll(intervalMs = 2000) {
  const { data, error, isValidating } = useSWR(
    "/api/modbus",
    fetcher,
    {
      refreshInterval: intervalMs,
      refreshWhenHidden: true,
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    loading: !data && !error,
    isRefreshing: isValidating,
  };
}
