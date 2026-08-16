import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Copy,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Trash2,
  HelpCircle,
  Check,
  Plus,
  Search,
  Eye,
  Edit2,
  AlertCircle,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { FBACaseContext, MarketplaceCode, ImportedCaseRow } from '../types';

interface AutomatedDataEntryProps {
  onSelectCase: (caseContext: FBACaseContext) => void;
  onOpenAdvisor: (prompt: string) => void;
}

const SAMPLE_CSV_CONTENT = `ASIN,Amazon Marketplace,Product Category,Customer Problem Statement,Monthly Units,Seller Reviews,Competitor Reviews,Is Brand Registered
B0FVVM1CSC,USA,Home & Kitchen,My competitor has many more reviews than my product and I want to understand what I can improve compliantly.,450,14,380,Yes
B08N5WRWNW,USA,Electronics & Accessories,Our organic search ranking and conversion rate dropped by 35% after competitor launched a cheaper multi-pack.,1200,85,920,Yes
B09K82MX7Q,UK,Sports & Outdoors,Experiencing a 7.2% return rate and recent 1-star reviews citing confusing assembly instructions.,280,32,150,No
B07T2K9R1V,USA,Beauty & Personal Care,Sponsored Products ACoS is exceeding 75% and our TACOS is eroding profit margins.,600,45,410,Yes
INVALID12,USA,Pet Supplies,Missing proper 10-char ASIN to show validation handling.,100,5,50,Yes`;

export const AutomatedDataEntry: React.FC<AutomatedDataEntryProps> = ({
  onSelectCase,
  onOpenAdvisor,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [importedCases, setImportedCases] = useState<ImportedCaseRow[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ImportedCaseRow>>({});

  const previewTableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ASIN Validator
  const validateAsin = (asin: string): { isValid: boolean; error?: string } => {
    const clean = (asin || '').trim().toUpperCase();
    if (!clean) {
      return { isValid: false, error: 'ASIN is required' };
    }
    if (clean.length !== 10) {
      return { isValid: false, error: `ASIN must be exactly 10 characters (got ${clean.length})` };
    }
    if (!/^[A-Z0-9]{10}$/.test(clean)) {
      return { isValid: false, error: 'ASIN must contain only alphanumeric characters (A-Z, 0-9)' };
    }
    return { isValid: true };
  };

  // Marketplace normalizer
  const normalizeMarketplace = (raw: string): MarketplaceCode => {
    const val = (raw || '').trim().toUpperCase();
    if (val.includes('UK') || val.includes('BRITAIN') || val.includes('CO.UK')) return 'UK';
    if (val.includes('DE') || val.includes('GERMANY') || val.includes('.DE')) return 'DE';
    if (val.includes('CA') || val.includes('CANADA') || val.includes('.CA')) return 'CA';
    if (val.includes('JP') || val.includes('JAPAN') || val.includes('.JP')) return 'JP';
    if (val.includes('AU') || val.includes('AUSTRALIA') || val.includes('.AU')) return 'AU';
    return 'USA';
  };

  // Robust CSV/TSV parser
  const parseCSVText = (csvString: string, isSample = false) => {
    setParsingError(null);
    setSuccessMessage(null);

    const trimmed = csvString.trim();
    if (!trimmed) {
      setParsingError('The imported file or pasted text is empty. Please provide CSV or Google Sheets data.');
      return;
    }

    const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setParsingError('CSV must contain a header row and at least one data row.');
      return;
    }

    // Determine delimiter: comma or tab
    const firstLine = lines[0];
    const delimiter = firstLine.includes('\t') ? '\t' : ',';

    // Helper for splitting quoted line
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(cur.trim().replace(/^["']|["']$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''));

    // Map column indices
    const findIndex = (keywords: string[]) => {
      return headers.findIndex((h) => keywords.some((k) => h.includes(k)));
    };

    const asinIdx = findIndex(['asin', 'amazonid', 'productid', 'sku']);
    const marketplaceIdx = findIndex(['marketplace', 'market', 'country', 'region']);
    const categoryIdx = findIndex(['category', 'productcategory', 'department', 'niche']);
    const problemIdx = findIndex(['problem', 'problemstatement', 'customerproblem', 'issue', 'goal', 'challenge', 'description']);

    // Optional columns
    const unitsIdx = findIndex(['monthlyunits', 'units', 'monthlysales', 'salesvelocity', 'orders']);
    const reviewsIdx = findIndex(['sellerreviews', 'currentreviews', 'reviewcount']);
    const compReviewsIdx = findIndex(['competitorreviews', 'compreviews', 'competitorreviewcount']);
    const ratingIdx = findIndex(['sellerrating', 'rating', 'starrating']);
    const compRatingIdx = findIndex(['competitorrating', 'comprating']);
    const priceIdx = findIndex(['price', 'asp', 'saleprice']);
    const brandRegIdx = findIndex(['brandregistered', 'isbrandregistered', 'brandregistry']);

    if (asinIdx === -1 && problemIdx === -1) {
      setParsingError('Could not locate required columns. Ensure your CSV has headers for "ASIN" and "Customer Problem Statement".');
      return;
    }

    const parsedRows: ImportedCaseRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

      const rawAsin = (asinIdx !== -1 ? cols[asinIdx] : cols[0]) || '';
      const rawMarketplace = (marketplaceIdx !== -1 ? cols[marketplaceIdx] : 'USA') || 'USA';
      const rawCategory = (categoryIdx !== -1 ? cols[categoryIdx] : '') || '';
      const rawProblem = (problemIdx !== -1 ? cols[problemIdx] : '') || '';

      const asinValidation = validateAsin(rawAsin);
      const missingRequired: string[] = [];

      if (!rawAsin.trim()) missingRequired.push('ASIN');
      if (!rawMarketplace.trim()) missingRequired.push('Amazon Marketplace');
      if (!rawCategory.trim()) missingRequired.push('Product Category');
      if (!rawProblem.trim()) missingRequired.push('Customer Problem Statement');

      // Optional parsed numbers
      const monthlyUnits = unitsIdx !== -1 && cols[unitsIdx] && !isNaN(Number(cols[unitsIdx])) ? Number(cols[unitsIdx]) : undefined;
      const currentReviews = reviewsIdx !== -1 && cols[reviewsIdx] && !isNaN(Number(cols[reviewsIdx])) ? Number(cols[reviewsIdx]) : undefined;
      const competitorReviews = compReviewsIdx !== -1 && cols[compReviewsIdx] && !isNaN(Number(cols[compReviewsIdx])) ? Number(cols[compReviewsIdx]) : undefined;
      const rating = ratingIdx !== -1 && cols[ratingIdx] && !isNaN(Number(cols[ratingIdx])) ? Number(cols[ratingIdx]) : undefined;
      const competitorRating = compRatingIdx !== -1 && cols[compRatingIdx] && !isNaN(Number(cols[compRatingIdx])) ? Number(cols[compRatingIdx]) : undefined;
      const price = priceIdx !== -1 && cols[priceIdx] && !isNaN(Number(cols[priceIdx])) ? Number(cols[priceIdx]) : undefined;
      const isBrandRegistered = brandRegIdx !== -1 && cols[brandRegIdx] ? ['yes', 'true', '1', 'y'].includes(cols[brandRegIdx].toLowerCase().trim()) : undefined;

      parsedRows.push({
        id: `import-${Date.now()}-${i}`,
        asin: rawAsin.trim().toUpperCase(),
        marketplace: normalizeMarketplace(rawMarketplace),
        category: rawCategory.trim(),
        problem: rawProblem.trim(),
        isValidAsin: asinValidation.isValid,
        asinError: asinValidation.error,
        missingRequiredFields: missingRequired,
        monthlyUnits,
        currentReviews,
        competitorReviews,
        rating,
        competitorRating,
        price,
        isBrandRegistered,
      });
    }

    if (parsedRows.length === 0) {
      setParsingError('No valid data rows found in the imported file.');
      return;
    }

    setImportedCases(parsedRows);
    const validCount = parsedRows.filter((r) => r.isValidAsin && r.missingRequiredFields.length === 0).length;
    const invalidCount = parsedRows.length - validCount;

    if (isSample) {
      setSuccessMessage(`Loaded ${parsedRows.length} sample FBA cases (${validCount} valid cases ready for 1-click diagnostic${invalidCount > 0 ? `, ${invalidCount} validation demo row` : ''}). Review the preview table below.`);
    } else {
      setSuccessMessage(`Successfully parsed ${parsedRows.length} case(s) from Google Sheets/CSV format. (${validCount} fully ready to activate)`);
    }

    // Auto-select first valid row
    const firstValid = parsedRows.find((r) => r.isValidAsin && r.missingRequiredFields.length === 0);
    if (firstValid) {
      setSelectedCaseId(firstValid.id);
    } else {
      setSelectedCaseId(parsedRows[0].id);
    }

    // Scroll to preview table if available
    setTimeout(() => {
      previewTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
      parseCSVText(text, false);
    };
    reader.onerror = () => {
      setParsingError('Error reading the selected file. Please try again or paste raw text.');
    };
    reader.readAsText(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Amazon_FBA_Case_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccessMessage('Downloaded Amazon_FBA_Case_Import_Template.csv. You can open and edit it in Google Sheets or Excel.');
  };

  const handleLoadSampleData = () => {
    setInputMode('paste');
    setInputText(SAMPLE_CSV_CONTENT);
    parseCSVText(SAMPLE_CSV_CONTENT, true);
  };

  const handleRowClick = (row: ImportedCaseRow) => {
    if (editingRowId === row.id) return;
    setSelectedCaseId(row.id);
    if (row.isValidAsin && row.missingRequiredFields.length === 0) {
      setParsingError(null);
      setSuccessMessage(`Selected valid case ASIN ${row.asin} (${row.marketplace}). Click "Load Case" to run the 4-Pillar FBA Audit.`);
    } else {
      const reasons: string[] = [];
      if (!row.isValidAsin) reasons.push(row.asinError || 'Invalid ASIN format');
      if (row.missingRequiredFields.length > 0) reasons.push(`Missing fields: ${row.missingRequiredFields.join(', ')}`);
      setParsingError(`Row #${row.id.replace('row-', '')} (${row.asin || 'Missing ASIN'}) cannot be loaded: ${reasons.join('. ')}. Click the edit icon to fix.`);
    }
  };

  const handleActivateCase = (caseRow: ImportedCaseRow) => {
    if (!caseRow.isValidAsin) {
      setParsingError(`Cannot load case: ASIN "${caseRow.asin || 'EMPTY'}" is invalid (${caseRow.asinError}). Please edit the ASIN first.`);
      return;
    }

    if (caseRow.missingRequiredFields.length > 0) {
      setParsingError(`Cannot load case: Missing required fields (${caseRow.missingRequiredFields.join(', ')}). Please complete these fields.`);
      return;
    }

    const context: FBACaseContext = {
      asin: caseRow.asin,
      marketplace: caseRow.marketplace,
      customerProblem: caseRow.problem,
      category: caseRow.category || undefined,
      sellerUnitsPerMonth: caseRow.monthlyUnits,
      sellerReviewCount: caseRow.currentReviews,
      competitorReviewCount: caseRow.competitorReviews,
      sellerRating: caseRow.rating,
      competitorRating: caseRow.competitorRating,
      price: caseRow.price,
      isBrandRegistered: caseRow.isBrandRegistered,
    };

    onSelectCase(context);
  };

  const handleStartEdit = (row: ImportedCaseRow) => {
    setEditingRowId(row.id);
    setEditFormData({
      asin: row.asin,
      marketplace: row.marketplace,
      category: row.category,
      problem: row.problem,
      monthlyUnits: row.monthlyUnits,
      currentReviews: row.currentReviews,
      competitorReviews: row.competitorReviews,
    });
  };

  const handleSaveEdit = (rowId: string) => {
    setImportedCases((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const newAsin = (editFormData.asin || '').trim().toUpperCase();
        const asinVal = validateAsin(newAsin);
        const missing: string[] = [];
        if (!newAsin) missing.push('ASIN');
        if (!editFormData.marketplace) missing.push('Amazon Marketplace');
        if (!editFormData.category?.trim()) missing.push('Product Category');
        if (!editFormData.problem?.trim()) missing.push('Customer Problem Statement');

        return {
          ...row,
          asin: newAsin,
          marketplace: editFormData.marketplace || 'USA',
          category: (editFormData.category || '').trim(),
          problem: (editFormData.problem || '').trim(),
          isValidAsin: asinVal.isValid,
          asinError: asinVal.error,
          missingRequiredFields: missing,
          monthlyUnits: editFormData.monthlyUnits,
          currentReviews: editFormData.currentReviews,
          competitorReviews: editFormData.competitorReviews,
        };
      })
    );
    setEditingRowId(null);
    setEditFormData({});
    setSuccessMessage('Row updated successfully.');
  };

  const filteredCases = importedCases.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.asin.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.problem.toLowerCase().includes(q) ||
      c.marketplace.toLowerCase().includes(q)
    );
  });

  const validCasesCount = importedCases.filter((c) => c.isValidAsin && c.missingRequiredFields.length === 0).length;
  const invalidCasesCount = importedCases.length - validCasesCount;
  const selectedCase = importedCases.find((c) => c.id === selectedCaseId);
  const isSelectedCaseValid = selectedCase && selectedCase.isValidAsin && selectedCase.missingRequiredFields.length === 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Automated Data Entry (Google Sheets & CSV Import)
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                Batch Diagnostic Ready
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Import one or multiple FBA cases directly from Google Sheets or CSV files. Automatically validates 10-character Amazon ASINs, extracts marketplace criteria, and identifies missing Seller Central metrics without inventing data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-download-csv-template"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              title="Download structured CSV template with standard FBA headers"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              Download CSV Template
            </button>
            <button
              id="btn-load-sample-sheet-data"
              onClick={handleLoadSampleData}
              className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
              Load Sample Sheet Data
            </button>
          </div>
        </div>

        {/* Quick Sample Presets Bar */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Quick Sample Presets:
          </span>
          <button
            type="button"
            onClick={handleLoadSampleData}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            Standard 5-Case Batch (All Fields)
          </button>
          <button
            type="button"
            onClick={() => {
              const singleCase = `ASIN,Amazon Marketplace,Product Category,Customer Problem Statement,Monthly Units,Seller Reviews,Competitor Reviews,Is Brand Registered\nB0FVVM1CSC,USA,Home & Kitchen,My competitor has many more reviews than my product and I want to understand what I can improve compliantly.,450,14,380,Yes`;
              setInputMode('paste');
              setInputText(singleCase);
              parseCSVText(singleCase, true);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Review Gap (B0FVVM1CSC)
          </button>
          <button
            type="button"
            onClick={() => {
              const cvrCase = `ASIN,Amazon Marketplace,Product Category,Customer Problem Statement,Monthly Units,Seller Reviews,Competitor Reviews,Is Brand Registered\nB08N5WRWNW,USA,Electronics & Accessories,Our organic search ranking and conversion rate dropped by 35% after competitor launched a cheaper multi-pack.,1200,85,920,Yes`;
              setInputMode('paste');
              setInputText(cvrCase);
              parseCSVText(cvrCase, true);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            CVR & Rank Drop (B08N5WRWNW)
          </button>
          <button
            type="button"
            onClick={() => {
              const returnCase = `ASIN,Amazon Marketplace,Product Category,Customer Problem Statement,Monthly Units,Seller Reviews,Competitor Reviews,Is Brand Registered\nB09K82MX7Q,UK,Sports & Outdoors,Experiencing a 7.2% return rate and recent 1-star reviews citing confusing assembly instructions.,280,32,150,No`;
              setInputMode('paste');
              setInputText(returnCase);
              parseCSVText(returnCase, true);
            }}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Return & Defect (B09K82MX7Q)
          </button>
        </div>

        {/* Required Fields Guide */}
        <div className="mt-3.5 pt-1 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              1. ASIN <span className="text-red-500 font-bold">*</span>
            </div>
            <span className="text-[11px] text-slate-500">10-character alphanumeric Amazon identifier (e.g. B0FVVM1CSC)</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              2. Amazon Marketplace <span className="text-red-500 font-bold">*</span>
            </div>
            <span className="text-[11px] text-slate-500">USA, UK, DE, CA, JP, or AU regional marketplace code</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              3. Product Category <span className="text-red-500 font-bold">*</span>
            </div>
            <span className="text-[11px] text-slate-500">Department classification for category CVR benchmarks</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              4. Problem Statement <span className="text-red-500 font-bold">*</span>
            </div>
            <span className="text-[11px] text-slate-500">Specific symptom (e.g. review gap, PPC bleed, return rate)</span>
          </div>
        </div>

        {/* Input Method Toggle & Area */}
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <button
              onClick={() => setInputMode('upload')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                inputMode === 'upload'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload CSV File
            </button>
            <button
              onClick={() => setInputMode('paste')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                inputMode === 'paste'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Paste from Google Sheets / Clipboard
            </button>
          </div>

          {inputMode === 'upload' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/50'
                  : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .tsv, .txt"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                Drop your Google Sheets export or CSV file here
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Supports <strong className="text-slate-700 font-mono">.csv</strong>, <strong className="text-slate-700 font-mono">.tsv</strong>, or tab-delimited text exports.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-slate-50"
                >
                  Browse File from Computer
                </button>
                <button
                  type="button"
                  id="btn-upload-load-sample"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSampleData();
                  }}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Try with Sample FBA Case Data
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Google Sheets / CSV Text Area
                </label>
                <button
                  type="button"
                  id="btn-paste-load-sample"
                  onClick={handleLoadSampleData}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Insert Sample Google Sheets Data
                </button>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={5}
                placeholder="Paste rows copied directly from Google Sheets or Excel (including header row)...&#10;ASIN,Amazon Marketplace,Product Category,Customer Problem Statement&#10;B0FVVM1CSC,USA,Home & Kitchen,Competitor has 10x more reviews..."
                className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800 leading-relaxed"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setInputText('')}
                  className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700"
                >
                  Clear Text
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => parseCSVText(inputText, false)}
                    disabled={!inputText.trim()}
                    className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors disabled:opacity-40"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    Parse & Preview Cases
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feedback Alerts */}
        {parsingError && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-200">
            <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Validation / Format Notice:</span>
              <span>{parsingError}</span>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Import Status:</span>
              <span>{successMessage}</span>
            </div>
          </div>
        )}
      </div>

      {/* Preview Table Section */}
      {importedCases.length > 0 ? (
        <div
          ref={previewTableRef}
          id="imported-cases-preview-table"
          className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden scroll-mt-6"
        >
          {/* Table Header Controls */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Imported Cases Preview ({importedCases.length} Total)
              </h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {validCasesCount} Ready to Load
              </span>
              {invalidCasesCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-900 rounded-md flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  {invalidCasesCount} Require Correction
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter ASIN, category, problem..."
                  className="text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden w-56"
                />
              </div>
              <button
                onClick={() => {
                  setImportedCases([]);
                  setSelectedCaseId(null);
                  setInputText('');
                  setSuccessMessage(null);
                  setParsingError(null);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear all imported rows"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Selected Case Banner */}
          {selectedCase && (
            <div className="border-b border-slate-200">
              {isSelectedCaseValid ? (
                <div
                  id="selected-case-active-banner"
                  className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-50 to-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                          Selected Case:
                        </span>
                        <span className="px-2 py-0.5 text-xs font-mono font-bold bg-white text-slate-900 border border-amber-300 rounded shadow-2xs">
                          {selectedCase.asin}
                        </span>
                        <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-white text-slate-700 border border-amber-200 rounded">
                          {selectedCase.marketplace}
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {selectedCase.category || 'General FBA'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5 line-clamp-1 italic">
                        "{selectedCase.problem}"
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="btn-load-selected-case-banner"
                    onClick={() => handleActivateCase(selectedCase)}
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-sm transition-all shrink-0 gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Load Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-red-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider">
                          Selected Row #{selectedCase.id.replace('row-', '')} (Cannot Load):
                        </span>
                        <span className="text-xs font-mono font-bold text-red-800">
                          {selectedCase.asin || 'Missing ASIN'}
                        </span>
                      </div>
                      <p className="text-xs text-red-700 mt-0.5">
                        {selectedCase.asinError || `Missing required fields: ${selectedCase.missingRequiredFields.join(', ')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(selectedCase)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      <Edit2 className="w-3 h-3 mr-1 text-slate-600" />
                      Edit to Fix
                    </button>
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                    >
                      Cannot Load Invalid Row
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table View */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Row #</th>
                  <th className="py-3 px-4">Target ASIN</th>
                  <th className="py-3 px-4">Marketplace</th>
                  <th className="py-3 px-4">Product Category</th>
                  <th className="py-3 px-4">Customer Problem Statement</th>
                  <th className="py-3 px-4">Optional Metrics Status</th>
                  <th className="py-3 px-4">Validation Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((row, idx) => {
                  const isSelected = selectedCaseId === row.id;
                  const isEditing = editingRowId === row.id;
                  const isFullyValid = row.isValidAsin && row.missingRequiredFields.length === 0;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => handleRowClick(row)}
                      className={`transition-all duration-150 ${
                        isSelected
                          ? isFullyValid
                            ? 'bg-amber-50/90 border-l-4 border-l-amber-600 ring-2 ring-amber-500/40 shadow-xs'
                            : 'bg-red-50/80 border-l-4 border-l-red-500 ring-2 ring-red-300 shadow-xs'
                          : isFullyValid
                            ? 'hover:bg-amber-50/30 cursor-pointer'
                            : 'hover:bg-red-50/20 cursor-pointer'
                      }`}
                    >
                      {/* Row Index & Select Indicator */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono align-top">
                        <div className="flex items-center gap-1.5">
                          {isSelected ? (
                            isFullyValid ? (
                              <span
                                className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0"
                                title="Selected Valid Case"
                              >
                                ✓
                              </span>
                            ) : (
                              <span
                                className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0"
                                title="Selected Invalid Case"
                              >
                                !
                              </span>
                            )
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 shrink-0">
                              {idx + 1}
                            </span>
                          )}
                          <span className={isSelected ? 'font-bold text-slate-900' : 'text-slate-500'}>
                            #{idx + 1}
                          </span>
                        </div>
                      </td>

                      {/* ASIN */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.asin || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, asin: e.target.value })}
                            maxLength={10}
                            className="w-28 text-xs font-mono font-bold uppercase bg-white border border-amber-500 rounded px-2 py-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div>
                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {row.asin || <em className="text-red-500 font-normal">Missing</em>}
                            </span>
                            {row.isValidAsin ? (
                              <div className="text-[10px] text-emerald-700 flex items-center gap-0.5 mt-0.5">
                                <Check className="w-3 h-3 text-emerald-600" />
                                Valid 10-char format
                              </div>
                            ) : (
                              <div className="text-[10px] text-red-600 font-medium flex items-center gap-0.5 mt-0.5">
                                <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                                {row.asinError}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Marketplace */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {isEditing ? (
                          <select
                            value={editFormData.marketplace || 'USA'}
                            onChange={(e) => setEditFormData({ ...editFormData, marketplace: e.target.value as MarketplaceCode })}
                            className="text-xs bg-white border border-amber-500 rounded px-2 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option value="USA">USA</option>
                            <option value="UK">UK</option>
                            <option value="DE">DE</option>
                            <option value="CA">CA</option>
                            <option value="JP">JP</option>
                            <option value="AU">AU</option>
                          </select>
                        ) : (
                          <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded">
                            {row.marketplace}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 align-top max-w-[140px]">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editFormData.category || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                            className="w-full text-xs bg-white border border-amber-500 rounded px-2 py-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : row.category ? (
                          <span className="text-slate-800 font-medium">{row.category}</span>
                        ) : (
                          <span className="text-red-500 italic text-[11px]">Missing category</span>
                        )}
                      </td>

                      {/* Problem Statement */}
                      <td className="py-3.5 px-4 align-top max-w-xs">
                        {isEditing ? (
                          <textarea
                            value={editFormData.problem || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, problem: e.target.value })}
                            rows={2}
                            className="w-full text-xs bg-white border border-amber-500 rounded p-1.5"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : row.problem ? (
                          <p className="text-slate-700 line-clamp-2 leading-relaxed">
                            "{row.problem}"
                          </p>
                        ) : (
                          <span className="text-red-500 italic text-[11px]">Missing problem statement</span>
                        )}
                      </td>

                      {/* Optional Metrics Status */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        <div className="space-y-1 text-[11px]">
                          {row.monthlyUnits !== undefined ? (
                            <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 mr-1">
                              {row.monthlyUnits} units/mo
                            </span>
                          ) : (
                            <span className="text-slate-400 block">• Units: Not provided</span>
                          )}
                          {row.currentReviews !== undefined ? (
                            <span className="inline-block px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 mr-1">
                              {row.currentReviews} reviews
                            </span>
                          ) : (
                            <span className="text-slate-400 block">• Reviews: Not provided</span>
                          )}
                          {row.isBrandRegistered !== undefined ? (
                            <span className={`inline-block px-1.5 py-0.2 rounded font-medium ${row.isBrandRegistered ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                              Brand Reg: {row.isBrandRegistered ? 'Yes' : 'No'}
                            </span>
                          ) : (
                            <span className="text-slate-400 block">• Brand Reg: Unconfirmed</span>
                          )}
                        </div>
                      </td>

                      {/* Validation Status */}
                      <td className="py-3.5 px-4 align-top whitespace-nowrap">
                        {isFullyValid ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Valid Case
                          </span>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-red-100 text-red-800">
                              <XCircle className="w-3.5 h-3.5 mr-1 text-red-600" />
                              Attention Needed
                            </span>
                            {row.missingRequiredFields.length > 0 && (
                              <p className="text-[10px] text-red-600">
                                Missing: {row.missingRequiredFields.join(', ')}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(row.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRowId(null)}
                              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleStartEdit(row)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit imported row"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {isFullyValid ? (
                              <button
                                type="button"
                                id={`btn-load-case-${row.id}`}
                                onClick={() => handleActivateCase(row)}
                                className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg shadow-2xs transition-all active:scale-95 ${
                                  isSelected
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400/40'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                                }`}
                              >
                                <Sparkles className="w-3 h-3 mr-1 text-amber-200" />
                                <span>Load Case</span>
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                title={`Cannot load: ${row.asinError || row.missingRequiredFields.join(', ')}`}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded-lg cursor-not-allowed"
                              >
                                <XCircle className="w-3 h-3 mr-1 text-slate-400" />
                                <span>Cannot Load</span>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Activation Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-600 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>
                Click any valid row above to select it, then click <strong>“Load Case”</strong> to activate into the 4-Pillar FBA Audit. Invalid rows cannot be loaded until corrected.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                {filteredCases.length} case(s) ({validCasesCount} valid)
              </span>
              {selectedCase && isSelectedCaseValid && (
                <button
                  type="button"
                  id="btn-footer-load-selected"
                  onClick={() => handleActivateCase(selectedCase)}
                  className="inline-flex items-center px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs transition-colors shrink-0"
                >
                  <Sparkles className="w-3 h-3 mr-1 text-amber-200" />
                  Load Case #{selectedCase.id.replace('row-', '')} ({selectedCase.asin})
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            No Cases Imported Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Upload your CSV file, paste rows from Google Sheets, or click the button below to instantly load and test with pre-built FBA sample case data.
          </p>
          <button
            type="button"
            id="btn-empty-load-sample"
            onClick={handleLoadSampleData}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
            Load Sample Sheet Data
          </button>
        </div>
      )}
    </div>
  );
};
