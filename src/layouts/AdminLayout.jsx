import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen grid grid-cols-[auto_1fr] bg-[#f8f8ff]">
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-6 md:p-10 bg-[#f8f8ff]">{children}</main>
      </div>
    </div>
  );
}
