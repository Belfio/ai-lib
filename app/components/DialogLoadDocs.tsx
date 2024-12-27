import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  //   DialogDescription,
  //   DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Upload from "./Upload";
import { useContext, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { UserContext } from "@/providers/userContext";
import primo from "@/lib/primoClient";

export function DialogLoadDocs() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const fetcher = useFetcher();
  const { user } = useContext(UserContext);
  const [uploading, setUploading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setUploading(true);
    e.preventDefault();
    if (!files) return;
    if (!user) return;
    // Upload files first and get their URLs/keys
    const folderId = user.PK;
    const fileUrls = await Promise.all(
      Array.from(files).map((f) => primo.uploadFileToS3(f, folderId))
    );

    console.log("fileUrls", fileUrls);
    // Add file URLs to formData
    const jobId = await primo.analyseFiles({
      fileUrls,
      folderId,
      userId: user?.PK || "unknownUser",
      userCompanyId: user?.companyId || "unknownCompany",
      creator: {
        email: user.email,
        name: user.name,
        surname: user.surname,
      },
    });
    console.log("jobId", jobId);
    setUploading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Load Documents</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        <fetcher.Form
          method="post"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="flex flex-col gap-4 mt-4"
        >
          <Upload files={files} setFiles={setFiles} />
          <div className="flex justify-end">
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </fetcher.Form>
        {/* <DialogFooter>
          <Button type="submit">Save changes</Button> */}
        {/* </DialogFooter>  */}
      </DialogContent>
    </Dialog>
  );
}
