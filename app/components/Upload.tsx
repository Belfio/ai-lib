import { Upload, Plus, X, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "./ui/button";

const FileItem = ({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) => (
  <div className="flex items-center justify-between bg-gray-100 p-2 rounded mt-2">
    <span>{name}</span>
    <button onClick={onRemove} className="text-red-500">
      <X size={16} />
    </button>
  </div>
);

export default function ModelUpload({
  className,
  files,
  setFiles,
}: {
  className?: string;
  files: FileList | null;
  setFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
}) {
  const addFile = (file: File) => {
    setFiles((prevFiles: FileList | null) => {
      const dataTransfer = new DataTransfer();
      if (prevFiles) {
        Array.from(prevFiles).forEach((f) => dataTransfer.items.add(f));
      }
      dataTransfer.items.add(file);
      return dataTransfer.files;
    });
  };

  const removeFile = (file: File) => {
    setFiles((prevFiles: FileList | null) => {
      if (prevFiles) {
        const dataTransfer = new DataTransfer();
        Array.from(prevFiles).forEach((f) => {
          if (f !== file) {
            dataTransfer.items.add(f);
          }
        });
        return dataTransfer.files;
      }
      return new FileList();
    });
  };
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => addFile(file));
    }
  };
  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <div className="bg-white rounded  mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center relative">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drag and drop your model files here, or click to select files
          </p>
          <input
            type="file"
            multiple
            onChange={(e) => handleInput(e)}
            title="Upload your model files"
            className="absolute w-full h-full custom-file-input opacity-0"
            name="attachments"
          />
          <Button className="mt-2 px-6 text-md py-6 bg-blue-500 text-white rounded hover:bg-blue-600">
            Select Files
          </Button>
        </div>
        <Alert className=" mx-auto mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supported Formats</AlertTitle>
          <AlertDescription>
            We accept various file types including .py, .pkl, .h5, .pt, .onnx,
            .json, .yaml, and more. Total upload size limit: 5GB
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <h4 className="font-semibold">Uploaded Files:</h4>
          {files &&
            Array.from(files).map((file) => (
              <FileItem
                key={file.name}
                name={file.name}
                onRemove={() => {
                  removeFile(file);
                }}
              />
            ))}
          <div className="relative">
            <input
              type="file"
              multiple
              onChange={(e) => {
                if (e.target.files) {
                  Array.from(e.target.files).forEach((file) => addFile(file));
                }
              }}
              title="Upload your model files"
              className="absolute w-full h-full custom-file-input"
            />
            <button className="mt-2 text-blue-500 flex items-center">
              <Plus size={16} className="mr-1" /> Add More Files
            </button>
          </div>
        </div>
        <div className="mt-6">
          <h4 className=" font-semibold mb-2">Upload Requirements</h4>
          <ul className="list-disc pl-5 text-sm text-gray-600">
            <li>
              Include all necessary files for your model (e.g., weights, config,
              preprocessor)
            </li>
            <li>Provide a requirements.txt file for any dependencies</li>
            <li>
              Include a README.md with instructions on how to use your model
            </li>
            <li>Ensure your files don&apos;t contain sensitive information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
