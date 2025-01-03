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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  JobType,
  ProcessPhase,
  ProcessPhaseSentence,
  JobStatus,
} from "@/lib/types";
("use client");

import { ChevronsUpDown, Download } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { Link } from "@remix-run/react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";

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
        <div className="mx-auto w-full max-w-sm flex flex-col justify-between h-full pb-12">
          <DrawerHeader>
            <DrawerTitle>Document analysis</DrawerTitle>
            <DrawerDescription>Review the analysis process.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex flex-col items-start justify-center space-y-2">
              <div className="flex items-center gap-2">
                <p>Process:</p>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job?.status === JobStatus.COMPLETED
                      ? "bg-green-100 text-green-800"
                      : job?.status === JobStatus.FAILED
                      ? "bg-red-100 text-red-800"
                      : job?.status === JobStatus.PROCESSING
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {job?.status}
                </span>
              </div>
              <div className="space-y-2">
                {Object.keys(ProcessPhase)
                  .filter((key) => isNaN(Number(key)))
                  .map((phaseKey) => {
                    const phase =
                      ProcessPhase[phaseKey as keyof typeof ProcessPhase];
                    return (
                      <div
                        key={phase}
                        className={`flex items-center space-x-2 w-full ${
                          Number(job?.processPhase) >= phase
                            ? "opacity-100"
                            : "opacity-50"
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            Number(job?.processPhase) >= phase
                              ? "bg-green-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <p>{ProcessPhaseSentence[phase]}</p>
                      </div>
                    );
                  })}
              </div>
            </div>

            <Card className="bg-gray-100 my-8 py-0">
              <CardContent className="flex flex-col items-start justify-center space-y-2 pt-2 pb-4 w-full">
                <p className="p-0">
                  Company name: {job?.companyDetails?.companyName}
                </p>
                <div className="w-full flex justify-start mt-2">
                  <Link to={`/company/${job?.companyDetails?.companyId}`}>
                    <Button>Profile page</Button>
                  </Link>
                  <Link to={`/company/${job?.companyDetails?.companyId}`}>
                    <Button variant="outline" className="ml-2">
                      One pager <Download className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            <div className="w-full mt-4">
              <Collapsible className="w-[350px] space-y-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2">
                    <p className="text-base font-normal">Extracted data</p>
                    <ChevronsUpDown className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-2">
                  <ScrollArea className="h-[300px]">
                    <Accordion type="single" collapsible className="w-full">
                      {job?.rawData && typeof job.rawData === "object" ? (
                        Object.entries(job.rawData).map(([key, value]) => (
                          <AccordionItem key={key} value={key}>
                            <AccordionTrigger className="text-sm font-medium">
                              {key}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="text-sm whitespace-pre-wrap p-2 bg-muted rounded-md">
                                {typeof value === "object"
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No data available
                        </p>
                      )}
                    </Accordion>
                  </ScrollArea>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
          <DrawerFooter>
            <Textarea
              placeholder=""
              className="border-0 bg-gray-0 resize-none h-[180px]"
            />
            <Input placeholder="Ask Primo" className="border-0 bg-gray-100" />
            <Button>Submit</Button>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
