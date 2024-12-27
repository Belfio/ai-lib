import type { MetaFunction } from "@remix-run/node";
import { Outlet, useActionData, useFetcher } from "@remix-run/react";
import { useContext, useState } from "react";
import Upload from "@/components/Upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UserContext } from "@/providers/userContext";

export const meta: MetaFunction = () => {
  return [
    { title: "PrimoAI" },
    { name: "description", content: "Welcome to PrimoAI" },
  ];
};

export default function UploadIndex() {
  const fetcher = useFetcher();
  const error = useActionData<typeof error>() as {
    error: string;
    missingFields: string[];
  };
  const { user } = useContext(UserContext);
  const [files, setFiles] = useState<FileList | null>(null);

  const uploadToS3 = async (file: File) => {
    const folderId = user?.PK;
    const fileUrl =
      "attachments/" +
      folderId +
      "/" +
      file.name.replace(/\s+/g, "").replace(/[^\w-]/g, "");
    // 1. Get pre-signed URL
    const response = await fetch("/api/doc/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: fileUrl,
        contentType: file.type,
      }),
    });

    const signedUrl = await response.json();

    console.log("signedUrl", signedUrl);
    // 2. Upload directly to S3

    await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
    return fileUrl;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    if (!files) return;

    // Upload files first and get their URLs/keys
    const fileUrls = await Promise.all(
      Array.from(files).map((f) => uploadToS3(f))
    );

    console.log("fileUrls", fileUrls);
    // Add file URLs to formData
    formData.append("attachments", JSON.stringify(fileUrls));
    formData.append("folderId", fileUrls[0].split("/")[1]);

    await fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      action: "/api/doc/upload/form",
    });
  };

  return (
    <div className="max-w-8xl mx-auto flex min-h-screen p-12">
      <div className="w-1/2 flex flex-col items-center justify-start">
        <div className="flex flex-col gap-4 max-w-[540px] p-4">
          <p className="text-xl font-bold">PrimoAI</p>
          <p>
            This demo will simulate an email service that receives a pitch deck
            and extracts the data.
          </p>
          <p>Fill the form below, attach a pitch deck and click send.</p>
        </div>
        <div className="flex flex-col gap-4 max-w-[540px]">
          <fetcher.Form
            method="post"
            onSubmit={handleSubmit}
            encType="multipart/form-data"
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

            <Button type="submit" disabled={fetcher.state === "submitting"}>
              {fetcher.state === "submitting" ? "Sending..." : "Send"}
            </Button>
          </fetcher.Form>
        </div>
      </div>
      <div className="w-1/2 flex flex-col items-center justify-start">
        <Outlet />
      </div>
    </div>
  );
}
