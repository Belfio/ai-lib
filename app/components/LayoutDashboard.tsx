import { Outlet } from "@remix-run/react";
import Nav from "./Nav";

export default function LayoutDashboard() {
  return (
    <div className="h-screen w-screen flex  ">
      <Nav />
      <div className="w-full h-full max-w-6xl">
        <Outlet />
      </div>
    </div>
  );
}
