"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { auth as firebaseAuth } from "@/lib/firebase";
import { Upload, FileDown, CheckCircle2, AlertTriangle, Loader2, X, Plus, Trash2, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";

export default function BulkBookingPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      return;
    }
    
    setFile(file);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Map the CSV columns to our required format
        const formattedData = results.data.map((row: any) => ({
          pickupAddress: row['Pickup Address'] || row['pickupAddress'] || '',
          dropAddress: row['Drop Address'] || row['dropAddress'] || '',
          vehicleType: row['Vehicle Type'] || row['vehicleType'] || 'tempo',
          loadType: row['Load Type'] || row['loadType'] || 'General',
          scheduledTime: row['Scheduled Time'] || row['scheduledTime'] || new Date().toISOString(),
          helpers: parseInt(row['Helpers'] || row['helpers'] || '0')
        }));
        
        setParsedData(formattedData);
        setResult(null); // Clear previous results
      },
      error: (error) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeRow = (index: number) => {
    const newData = [...parsedData];
    newData.splice(index, 1);
    setParsedData(newData);
  };

  const handleBulkUpload = async () => {
    if (!user || !firebaseAuth.currentUser) return;
    if (parsedData.length === 0) {
      toast.error("No valid data to upload.");
      return;
    }
    
    setLoading(true);
    setResult(null);

    try {
      const token = await firebaseAuth.currentUser.getIdToken();
      const res = await fetch((`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/?$/, '')}`) + "/api/business/bookings/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ bookings: parsedData })
      });
      const json = await res.json();
      if (json.success) {
        setResult({ success: true, ...json.data });
        toast.success("Bulk bookings created successfully!");
      } else {
        setResult({ success: false, error: json.error || "Upload failed" });
        toast.error(json.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      setResult({ success: false, error: "Network error" });
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['Pickup Address', 'Drop Address', 'Vehicle Type', 'Load Type', 'Scheduled Time', 'Helpers'];
    const sampleRow = ['Andheri East, Mumbai', 'Thane West, Thane', 'tempo', 'Boxes', new Date().toISOString(), '0'];
    
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "cargohub_bulk_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--text-primary)] mb-2">Bulk Bookings</h1>
          <p className="text-[var(--text-secondary)]">Upload CSV files to create multiple fleet shipments at once.</p>
        </div>
        <button 
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-outline)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] font-semibold rounded-xl transition-all shadow-sm text-sm"
        >
          <FileDown className="w-4 h-4 text-orange-500" /> Download CSV Template
        </button>
      </div>

      <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-outline)] p-1 mb-8">
        <div 
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center transition-all ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-[var(--border-outline)] hover:border-blue-500/50 hover:bg-[var(--bg-tertiary)]'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".csv"
            className="hidden"
          />
          
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-600 mb-4 shadow-sm shadow-blue-500/10">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">Drag & drop your CSV file here</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">Or click below to browse your files. Max 100 rows recommended.</p>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 text-sm"
          >
            Browse Files
          </button>
        </div>
      </div>

      {/* Result Status */}
      {result && (
        <div className={`mb-8 p-5 rounded-2xl border ${result.success ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <div className="flex items-center gap-3 mb-2">
            {result.success ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
            <span className={`text-lg font-bold ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {result.success ? "Bulk Upload Complete" : "Upload Failed"}
            </span>
          </div>
          {result.success ? (
            <div className="text-sm text-green-600 dark:text-green-400 pl-9 font-medium">
              Successfully created {result.created} bookings. Failed: {result.failed}.
              {result.errors && result.errors.length > 0 && (
                <ul className="mt-2 text-xs list-disc pl-4 text-red-500">
                  {result.errors.map((e: any, i: number) => <li key={i}>Row {e.row}: {e.message}</li>)}
                </ul>
              )}
            </div>
          ) : (
            <div className="text-sm text-red-600 dark:text-red-400 pl-9">{result.error}</div>
          )}
        </div>
      )}

      {/* Preview Table */}
      {parsedData.length > 0 && !result?.success && (
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-outline)] overflow-hidden">
          <div className="p-5 border-b border-[var(--border-outline)] flex justify-between items-center bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-sm">Data Preview: {file?.name}</h3>
                <p className="text-xs text-[var(--text-secondary)]">{parsedData.length} rows ready to process</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={clearFile}
                className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                title="Clear Data"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[var(--bg-card)] sticky top-0 border-b border-[var(--border-outline)] z-10 shadow-sm text-[var(--text-secondary)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">#</th>
                  <th className="px-6 py-4 font-semibold">Pickup Address</th>
                  <th className="px-6 py-4 font-semibold">Drop Address</th>
                  <th className="px-6 py-4 font-semibold">Vehicle</th>
                  <th className="px-6 py-4 font-semibold">Time</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-outline)]">
                {parsedData.map((row, index) => (
                  <tr key={index} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-6 py-4 text-[var(--text-muted)] font-mono text-xs">{index + 1}</td>
                    <td className="px-6 py-4">
                      <p className="text-[var(--text-primary)] font-medium truncate max-w-[200px]" title={row.pickupAddress}>{row.pickupAddress}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[var(--text-primary)] font-medium truncate max-w-[200px]" title={row.dropAddress}>{row.dropAddress}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg text-xs font-semibold capitalize">
                        {row.vehicleType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)] text-xs">
                      {new Date(row.scheduledTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => removeRow(index)}
                        className="text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-5 border-t border-[var(--border-outline)] bg-[var(--bg-secondary)] flex justify-end">
            <button 
              onClick={handleBulkUpload}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {loading ? "Processing Upload..." : `Upload ${parsedData.length} Bookings`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
