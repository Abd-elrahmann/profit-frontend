import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu as MenuIcon, Notifications as NotificationsIcon, CheckCircle as CheckCircleIcon } from "@mui/icons-material";
import { useAuth } from "../Contexts/AuthContext";
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
  const notificationsRef = useRef(null);
  const prevCountRef = useRef(count);

  const showAvatar = user?.profileImage && !imgError;
  const userRole = user?.role?.name || (user?.roleId === 1 ? "مدير النظام" : "مستخدم");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleNotificationClick = (link) => {
    setShowNotifications(false);
    navigate(link);
  };

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-primary/5 px-4 md:px-8 flex items-center justify-between shrink-0 fixed top-0 left-0 right-0 z-[1100]">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button
          type="button"
          data-sidebar-toggle
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onMenuToggle(); }}
          className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors touch-manipulation cursor-pointer -ml-1"
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
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            className={`relative p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors ${shouldShake ? "animate-bell-ring" : ""}`}
            aria-label="الإشعارات"
          >
            <NotificationsIcon sx={{ fontSize: 26, color: "inherit" }} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed top-12 left-1/2 -translate-x-1/2 mt-2 w-80 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[1200] max-h-[85vh] overflow-hidden md:absolute md:top-full md:left-0 md:translate-x-0 md:mt-2">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shrink-0">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    الإشعارات
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {count > 0
                      ? `${count} قيد يحتاج اعتماد`
                      : "لا توجد إشعارات جديدة"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationClick("/journal-entries")}
                  className="shrink-0 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                >
                  الذهاب للقيود
                </button>
              </div>
              <div className="py-2 overflow-y-auto max-h-[60vh] min-h-0">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    لا توجد قيود تحتاج اعتماد
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-2 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                    >
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleNotificationClick(n.link)}
                      >
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {n.detail}
                        </p>
                      </div>
                      {canPostJournals && (
                        <button
                          type="button"
                          onClick={(e) => onApproveJournal(n.journalId, e)}
                          disabled={approvingId === n.journalId}
                          className="shrink-0 p-2 rounded-lg text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="اعتماد القيد"
                          aria-label="اعتماد القيد"
                        >
                          {approvingId === n.journalId ? (
                            <div className="size-[22px] rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                          ) : (
                            <CheckCircleIcon sx={{ fontSize: 22 }} />
                          )}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative flex items-center gap-3 border-r border-slate-200 dark:border-slate-700 pr-4 md:pr-6">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setShowUserMenu((v) => !v)}
            onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
            tabIndex={0}
            role="button"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                {user?.name || "مستخدم"}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">{userRole}</p>
            </div>
            <div className="relative size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
              {showAvatar ? (
                <img
                  src={user.profileImage}
                  alt={user?.name ? `صورة ${user.name}` : "صورة المستخدم"}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="text-primary font-bold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                </span>
              )}
            </div>
          </div>

          {showUserMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/profile");
                }}
                className="w-full px-4 py-2 text-right text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                الملف الشخصي
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
