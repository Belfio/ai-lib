import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Button } from "@/components/ui/button";

export const meta: MetaFunction = () => {
  return [
    { title: "PrimoAI" },
    { name: "description", content: "Welcome to PrimoAI" },
  ];
};

export default function Index() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p>Hello I am PrimoAI</p>
      <div className="flex flex-col gap-4 max-w-[540px]">
        <p>
          This demo will simulate an email service that receives a pitch deck
          and extracts the data.
        </p>
        <Link to="/upload">
          <Button>Test demo</Button>
        </Link>
      </div>
    </div>
  );
}
