"use client";

import { useState, useRef } from "react";
import { FaUpload, FaFilePdf, FaFileWord, FaFileAlt } from "react-icons/fa";

const ALLOWED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
};

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [checkboxes, setCheckboxes] = useState({
    terms: false,
    privacy: false,
    consent: false,
  });
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    const fileType = selectedFile.type;
    if (!Object.keys(ALLOWED_FILE_TYPES).includes(fileType)) {
      setError("Please upload a PDF, Word document, or text file");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
  };

  const handleCheckboxChange = (name: keyof typeof checkboxes) => {
    setCheckboxes((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!Object.values(checkboxes).every(Boolean)) {
      setError("Please accept all terms and conditions");
      return;
    }

    // Here you would typically handle the file upload
    // For now, we'll just log it
    console.log("Uploading file:", file);
    console.log("Checkboxes state:", checkboxes);
  };

  const getFileIcon = () => {
    if (!file) return <FaUpload className="w-8 h-8" />;

    const fileType = file.type;
    if (fileType === "application/pdf")
      return <FaFilePdf className="w-8 h-8" />;
    if (fileType.includes("word")) return <FaFileWord className="w-8 h-8" />;
    return <FaFileAlt className="w-8 h-8" />;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Upload Document
      </h2>

      {/* File Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-custom-blue transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
        />
        <div className="max-auto flex justify-center">{getFileIcon()}</div>
        <p className="mt-2 text-sm text-gray-600">
          {file ? file.name : "Click to upload or drag and drop"}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF, Word documents, or text files only
        </p>
      </div>

      {/* Checkboxes */}
      <div className="mt-6 space-y-4">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={checkboxes.terms}
            onChange={() => handleCheckboxChange("terms")}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            I agree to the terms and conditions
          </span>
        </label>

        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={checkboxes.privacy}
            onChange={() => handleCheckboxChange("privacy")}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            I have read and understood the privacy policy
          </span>
        </label>

        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={checkboxes.consent}
            onChange={() => handleCheckboxChange("consent")}
            className="mt-1"
          />
          <span className="text-sm text-gray-700">
            I consent to the processing of my data
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || !Object.values(checkboxes).every(Boolean)}
        className="mt-6 w-full bg-custom-blue text-white py-2 px-4 rounded-lg hover:bg-custom-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Upload Document
      </button>
    </div>
  );
}
