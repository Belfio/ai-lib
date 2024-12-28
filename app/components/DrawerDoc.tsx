"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { JobType } from "@/lib/types";

export default function DrawerDoc({
  job,
  open,
  setOpen,
}: {
  job: JobType | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Document analysis</DrawerTitle>
            <DrawerDescription>Find the analysis process.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex flex-col items-center justify-center space-x-2">
              <p>Process</p>
              <p>Data uploading</p>
              <p>Information extraction</p>
              <p>Vector database creation</p>
              <p>Model training</p>
              <p>Model evaluation</p>
              <p>Model deployment</p>
            </div>
          </div>
          <DrawerFooter>
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
