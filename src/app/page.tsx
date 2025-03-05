"use client";
import { useState, useRef } from "react";
import { FiUploadCloud, FiFile, FiX, FiCheckCircle } from "react-icons/fi";

export default function UploadPage() {
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".csv")) {
        setUploadedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      if (file.name.endsWith(".csv")) {
        setUploadedFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!uploadedFile) return;

    const formData = new FormData();
    formData.append("file", uploadedFile);


    setStatus({ type: "loading", message: "Uploading..." });

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        setStatus({
          type: "success",
          message: `File uploaded successfully as ${result.fileId}`,
        });
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const errorResponse = await res.json();
        throw new Error(errorResponse.error || "Upload failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error uploading file. Please try again.";
      setStatus({ type: "error", message: errorMessage });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Upload CSV File
          </h1>

          <form onSubmit={handleSubmit}>
            <div
              className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-all
                ${
                  dragActive
                    ? "border-blue-500 bg-blue-50 animate-pulse"
                    : "border-gray-300 hover:border-gray-400"
                }
                ${status.type === "error" ? "border-red-500" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                required
              />

              <div className="flex flex-col items-center">
                <FiUploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  {dragActive
                    ? "Drop your CSV file here"
                    : "Drag & drop CSV file or"}
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Browse files
                </button>
              </div>
            </div>

            {uploadedFile && (
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <FiFile className="text-gray-500" />
                  <span className="text-gray-700 truncate">
                    {uploadedFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={status.type === "loading" || !uploadedFile}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors
                ${
                  status.type === "loading" || !uploadedFile
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {status.type === "loading" ? "Processing..." : "Upload File"}
            </button>
          </form>

          {status.message && (
            <div className="mt-6 p-4 rounded-lg text-sm bg-blue-100 text-blue-700">
              <div className="flex items-center space-x-2">
                {status.type === "success" && <FiCheckCircle className="w-4 h-4" />}
                <span>{status.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
