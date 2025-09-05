"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportGenerator({ type, apiUrl, metricsOptions }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterId, setFilterId] = useState("");

  // Fetch report data
  const fetchReport = async () => {
    if (!startDate || !endDate || !filterId || selectedMetrics.length === 0) {
      alert("Please select all filters!");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });

      if (type === "cpm") params.append("cylinder", filterId);
      if (type === "vm") params.append("channel", filterId);

      const res = await fetch(`${apiUrl}?${params}`);
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error("❌ Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    if (records.length === 0) {
      alert("No data to export!");
      return;
    }

    // Pick only selected metrics
    const filteredData = records.map((row) => {
      const obj = { timestamp: row.timestamp };
      selectedMetrics.forEach((metric) => {
        obj[metric.value] = row.values?.[metric.value] || row[metric.value] || "-";
      });
      return obj;
    });

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${type.toUpperCase()}_Report_${Date.now()}.xlsx`);
  };

  return (
    <Card className="p-5">
      <CardHeader>
        <CardTitle>{type.toUpperCase()} Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Start Date */}
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              className="border p-2 w-full rounded"
              placeholderText="Select start date"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-sm font-medium">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              className="border p-2 w-full rounded"
              placeholderText="Select end date"
            />
          </div>

          {/* Cylinder / Channel Input */}
          <div>
            <label className="text-sm font-medium">
              {type === "cpm" ? "Cylinder" : "Channel"}
            </label>
            <input
              type="text"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="border p-2 w-full rounded"
              placeholder={type === "cpm" ? "Enter cylinder" : "Enter channel"}
            />
          </div>

          {/* Metrics Multi Select */}
          <div>
            <label className="text-sm font-medium">Select Metrics</label>
            <Select
              options={metricsOptions}
              isMulti
              value={selectedMetrics}
              onChange={setSelectedMetrics}
              placeholder="Select metrics"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-4">
          <Button onClick={fetchReport} disabled={loading}>
            {loading ? "Fetching..." : "Generate Report"}
          </Button>
          <Button onClick={exportToExcel} variant="secondary">
            Export to Excel
          </Button>
        </div>

        {/* Data Table */}
        {records.length > 0 && (
          <div className="overflow-auto max-h-[400px] mt-5 border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Timestamp</th>
                  {selectedMetrics.map((metric) => (
                    <th key={metric.value} className="p-2 border">
                      {metric.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      {new Date(row.timestamp).toLocaleString()}
                    </td>
                    {selectedMetrics.map((metric) => (
                      <td key={metric.value} className="p-2 border text-center">
                        {row.values?.[metric.value] || row[metric.value] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
