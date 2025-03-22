import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <main className="flex-grow mt-15 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}