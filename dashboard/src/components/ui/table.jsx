import React from "react";

export function Table({ children, className = "" }) {
  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 ${className}`}>
      <table className="w-full border-collapse text-sm text-gray-700 dark:text-gray-200">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>;
}

export function TableRow({ children }) {
  return <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">{children}</tr>;
}

export function TableHead({ children, className = "" }) {
  return (
    <th
      className={`px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 ${className}`}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }) {
  return (
    <td
      className={`px-4 py-3 text-gray-600 dark:text-gray-200 ${className}`}
    >
      {children}
    </td>
  );
}
