import { useRef, useState } from 'react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

/**
 * Prominent drag-and-drop file zone. Supports multiple files, shows chosen names.
 * Use with: value = array of File, onChange = (files) => setData('statement_files', files).
 */
export default function FileUploadZone({ value = [], onChange, accept = '.csv,text/csv,application/pdf,.pdf', maxFiles = 5, required, className = '' }) {
    const inputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const files = Array.isArray(value) ? value : [];

    const handleClick = () => inputRef.current?.click();

    const processFiles = (fileList) => {
        if (!fileList?.length) return;
        const arr = Array.from(fileList).slice(0, maxFiles);
        onChange(arr);
    };

    const handleChange = (e) => {
        processFiles(e.target.files || []);
        e.target.value = '';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        processFiles(e.dataTransfer?.files || []);
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                multiple
                accept={accept}
                onChange={handleChange}
                className="hidden"
                required={required && files.length === 0}
            />
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'}
                    ${className}
                `}
            >
                <DocumentArrowUpIcon className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                    {files.length > 0
                        ? `${files.length} file(s) chosen — click to change`
                        : 'Drag files here or click to choose'}
                </p>
                <p className="text-xs text-gray-500">
                    CSV or PDF, up to {maxFiles} files
                </p>
                {files.length > 0 && (
                    <ul className="mt-3 text-xs text-gray-600 list-disc list-inside text-left max-h-24 overflow-y-auto">
                        {files.map((f, i) => (
                            <li key={i}>{f.name}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
