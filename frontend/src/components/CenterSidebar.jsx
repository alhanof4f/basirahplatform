import { NavLink, useNavigate } from "react-router-dom";
import {
  HiSquares2X2,
  HiUserGroup,
  HiUser,
  HiDocumentText,
  HiCreditCard,
  HiCog6Tooth,
  HiArrowRightOnRectangle,
} from "react-icons/hi2";

const navItems = [
  { to: "/center-dashboard", label: "الرئيسية", icon: HiSquares2X2 },
  { to: "/center-doctors", label: "الأطباء", icon: HiUserGroup },
  { to: "/center-patients", label: "المرضى", icon: HiUser },
  { to: "/center-reports", label: "التقارير", icon: HiDocumentText },
  { to: "/center-subscriptions", label: "الاشتراك والفواتير", icon: HiCreditCard },
  { to: "/center-settings", label: "الإعدادات", icon: HiCog6Tooth },
];

export default function CenterSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("centerToken");
    localStorage.removeItem("centerInfo");
    navigate("/center-login", { replace: true });
  };

  const baseLink =
    "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition text-[18px]";

  return (
    <aside
      className="w-[320px] min-h-screen bg-white border-l border-gray-200 px-6 py-6 flex flex-col"
      dir="rtl"
    >
      {/* Logo */}
      <div className="flex items-center justify-center flex-col gap-2 mb-6">
        <div className="text-3xl font-bold text-slate-800">بصيرة</div>
        <div className="text-sm text-gray-500">منصة المركز</div>
      </div>

      {/* Links */}
      <nav className="flex flex-col gap-2 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? `${baseLink} bg-[#0f2a4d] text-white shadow`
                  : `${baseLink} text-slate-700 hover:bg-gray-50`
              }
              end
            >
              <span className="flex items-center gap-3">
                <Icon className="text-2xl" />
                <span className="font-medium">{item.label}</span>
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[18px] text-slate-800 hover:bg-red-50 transition"
      >
        <span className="flex items-center gap-3">
          <HiArrowRightOnRectangle className="text-2xl text-red-600" />
          <span className="font-medium">تسجيل خروج</span>
        </span>
      </button>
    </aside>
  );
}
