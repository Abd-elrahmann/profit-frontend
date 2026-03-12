import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useAuth } from "../Contexts/AuthContext";
import NavbarNotifications from "./NavbarNotifications";
import NavbarUserMenu from "./NavbarUserMenu";
import { useNotifications } from "../Contexts/NotificationsContext";
import { usePermissions } from "../Contexts/PermissionsContext";
import Logo from "/assets/images/logo.webp";
const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { notifications, count, shouldShake, onApproveJournal, approvingId } = useNotifications();
  const { permissions } = usePermissions();
  const canPostJournals = permissions?.includes("journals_Post") ?? false;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [imgError, setImgError] = useState(false);
  const prevCountRef = useRef(count);
  const prevProfileImageRef = useRef(user?.profileImage);
  useEffect(() => {
    if (user?.profileImage !== prevProfileImageRef.current) {
      prevProfileImageRef.current = user?.profileImage;
      setImgError(false);
    }
  }, [user?.profileImage]);
  const showAvatar = user?.profileImage && !imgError;
  const userRole = user?.role?.name || "بدون دور";
  useEffect(() => {
    if (prevCountRef.current > 0 && count === 0 && showNotifications) {
      setShowNotifications(false);
    }
    prevCountRef.current = count;
  }, [count, showNotifications]);
  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate("/login", { replace: true });
  };
  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-primary/5 px-4 md:px-8 flex items-center justify-between shrink-0 fixed top-0 left-0 right-0 z-[1100]">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          type="button"
          data-sidebar-toggle
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMenuToggle?.(); }}
          className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation cursor-pointer -ml-1"
          aria-label="فتح/إغلاق القائمة"
          style={{ touchAction: 'manipulation' }}
        >
          <MenuIcon sx={{ fontSize: 24, color: "inherit" }} />
        </button>
        <div className="flex items-center gap-2 md:gap-3 shrink-0 min-w-0">
          <img src={Logo} alt="Logo" className="size-7 md:size-8 object-contain shrink-0" />
          <span className="font-bold text-primary text-xs sm:text-base md:text-lg whitespace-nowrap truncate">
            نظام إدارة السلف
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-6 shrink-0">
        <NavbarNotifications
          notifications={notifications}
          count={count}
          shouldShake={shouldShake}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          onApproveJournal={onApproveJournal}
          approvingId={approvingId}
          canPostJournals={canPostJournals}
        />
        <NavbarUserMenu
          user={user}
          userRole={userRole}
          showAvatar={showAvatar}
          setImgError={setImgError}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
};
export default Navbar;