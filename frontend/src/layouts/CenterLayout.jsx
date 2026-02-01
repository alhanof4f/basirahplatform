import CenterSidebar from "../components/CenterSidebar.jsx";
import CenterTopbar from "../components/CenterTopbar.jsx";

export default function CenterLayout({ title, children }) {
  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      <CenterSidebar />

      <div className="flex-1 flex flex-col">
        <CenterTopbar title={title} />
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
