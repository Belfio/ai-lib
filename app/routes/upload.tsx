import type { MetaFunction } from "@remix-run/node";
import { Outlet, useActionData, useFetcher } from "@remix-run/react";

import { useState } from "react";

import Upload from "@/components/Upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "PrimoAI" },
    { name: "description", content: "Welcome to PrimoAI" },
  ];
};

export default function Index() {
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
      action: "/api/doc/upload/file",
    });
  };
  return (
    <div className="max-w-8xl mx-auto flex min-h-screen p-12">
      <div className="w-1/2 flex flex-col items-center justify-start">
        <p>Hello I am PrimoAI</p>

        <div className="flex flex-col gap-4 max-w-xl">
          <fetcher.Form
            method="post"
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 mt-4"
          >
            <Input type="text" name="email" placeholder="Email from" />
            <Input type="text" name="subject" placeholder="Email subject" />
            <Textarea
              name="body"
              placeholder="Email body"
              className="mt-3 resize-none h-[120px]"
            />
            <Upload files={files} setFiles={setFiles} />
            <Button type="submit">Send</Button>
          </fetcher.Form>
        </div>
      </div>
      <div className="w-1/2 flex flex-col items-center justify-start">
        <Outlet />
      </div>
    </div>
  );
}

export const loader = async () => {
  return {};
};
