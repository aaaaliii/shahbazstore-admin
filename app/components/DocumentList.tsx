"use client";

import { useState } from "react";
import Table from "./Table";
import { format } from "date-fns";

interface Document {
  id: string;
  user_id: string;
  org_id: string;
  filename: string;
  storage_path: string;
  created_at: string;
}

const columns = [
  { header: "ID", accessor: "id" as const },
  { header: "User ID", accessor: "user_id" as const },
  { header: "Organization ID", accessor: "org_id" as const },
  { header: "Filename", accessor: "filename" as const },
  { header: "Storage Path", accessor: "storage_path" as const },
  {
    header: "Created At",
    accessor: "created_at" as const,
    render: (row: Document) =>
      format(new Date(row.created_at), "MMM dd, yyyy HH:mm"),
  },
];

// Sample data - replace with actual data from your API
const sampleData: Document[] = [
  {
    id: "1",
    user_id: "user123",
    org_id: "org456",
    filename: "sample.pdf",
    storage_path: "/documents/sample.pdf",
    created_at: "2024-03-20T10:00:00Z",
  },
  // Add more sample data as needed
];

export default function DocumentList() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Documents</h2>
        <Table
          columns={columns}
          data={sampleData}
          itemsPerPage={10}
          onRowClick={(row) => console.log("Clicked document:", row)}
        />
      </div>
    </div>
  );
}
