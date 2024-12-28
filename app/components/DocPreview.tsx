import { Form, Link } from "@remix-run/react";
import { Button } from "./ui/button";
import { Trash2Icon } from "lucide-react";

export interface DocPreviewProps {
  id: string;
  date: string;
  uploader: string;
  numberOfDocs: number;
  status: string;
  title: string;
  summary: string;
  companyId: string;
  companyName: string;
  firmId: string;
  fileUrls: string[];
  onClick: () => void;
}

export default function DocPreview({
  id,
  date,
  uploader,
  numberOfDocs,
  status,
  title,
  summary,
  firmId,
  companyId,
  companyName,
  fileUrls,
  onClick,
}: DocPreviewProps) {
  return (
    <div>
      <div className="flex justify-start items-center">
        <Button variant="ghost" onClick={onClick}>
          <div className="min-w-[180px] w-[180px] h-[120px] bg-gray-100 rounded-lg py-2 px-4">
            <p className="text-[10px] text-gray-500 font-light">
              {new Date(date).toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
            <p className="text-sm font-medium mt-4">{uploader}</p>
            <p className="text-xs text-gray-500 font-light">
              Number of files: {numberOfDocs}
            </p>
            <p className="text-[10px] text-gray-500 uppercase mt-5 font-semibold tracking-wide">
              {status}
            </p>
          </div>
        </Button>
        <div className="w-full px-4">
          <Button variant="ghost" onClick={onClick}>
            <div className="w-full px-4 border rounded-lg p-2 h-[120px] overflow-hidden">
              <h2 className="text-sm font-medium">
                {companyName} - {title}
              </h2>
              <p className="text-xs text-gray-900 leading-relaxed h-[64px] overflow-hidden text-ellipsis font-light">
                {summary}
              </p>
              <p className="text-[10px] text-gray-900 leading-relaxed h-[16px] overflow-hidden text-ellipsis font-light">
                Company ID: {companyId}
              </p>
            </div>
          </Button>
        </div>
        <div className="flex justify-end items-center">
          <Form method="POST" action="/dashboard">
            <Button variant="outline" name="action" value="remove">
              <Trash2Icon className="w-4 h-4" />
            </Button>
            <input type="hidden" name="firmId" value={firmId} />
            <input type="hidden" name="createdAt" value={date} />
            <input type="hidden" name="fileUrls" value={fileUrls} />
          </Form>
        </div>
      </div>
    </div>
  );
}
