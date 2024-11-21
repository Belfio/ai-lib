import { useActionData, useFetcher } from "@remix-run/react";

import { useState } from "react";

import Upload from "@/components/Upload";

export default function ModelAdd() {
  const fetcher = useFetcher();
  const error = useActionData<typeof error>() as {
    error: string;
    missingFields: string[];
  };

  const [files, setFiles] = useState<FileList | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    if (!files) return;
    Array.from(files).map((file) => formData.append(file.name, file));
    console.log("sending files?", files.length);
    await fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      action: "/api/model/add/file",
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-[540px]">
      <fetcher.Form method="post" onSubmit={handleSubmit}>
        <Upload files={files} setFiles={setFiles} className="mt-3" />
      </fetcher.Form>
    </div>
  );
}
export const loader = async () => {
  return {};
};
