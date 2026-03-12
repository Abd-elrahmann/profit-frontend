import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { secureGetBlobUrl } from '../../utilities/fileUtils';

const isUploadsUrl = (url) => url && typeof url === 'string' && url.includes('/uploads/');

const NavbarUserMenu = ({
  user,
  userRole,
  showAvatar,
  setImgError,
  showUserMenu,
  setShowUserMenu,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [profileImgSrc, setProfileImgSrc] = useState(null);

  useEffect(() => {
    if (!user?.profileImage) {
      setProfileImgSrc(null);
      return;
    }
    if (!isUploadsUrl(user.profileImage)) {
      setProfileImgSrc(user.profileImage);
      return;
    }
    let revoked = false;
    let blobUrl = null;
    secureGetBlobUrl(user.profileImage)
      .then((url) => {
        blobUrl = url;
        if (!revoked) {
          setProfileImgSrc(url);
        } else if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
        }
      })
      .catch(() => {
        if (!revoked) setProfileImgSrc(null);
      });
    return () => {
      revoked = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [user?.profileImage]);

  const displayImgSrc = user?.profileImage && isUploadsUrl(user.profileImage) ? profileImgSrc : user?.profileImage;
  const showImg = displayImgSrc;

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  return (
    <div className="relative flex items-center gap-3 border-r border-slate-200 dark:border-slate-700 pr-4 md:pr-6">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setShowUserMenu((v) => !v)}
        onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
        tabIndex={0}
        role="button"
      >
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">{user?.name || 'مستخدم'}</p>
          <p className="text-[10px] text-slate-500 mt-1">{userRole}</p>
        </div>
        <div className="relative size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0">
          {showImg ? (
            <img
              src={displayImgSrc}
              alt={user?.name ? `صورة ${user.name}` : 'صورة المستخدم'}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError?.(true)}
            />
          ) : (
            <span className="text-primary font-bold text-sm">{user?.name ? user.name.charAt(0).toUpperCase() : '?'}</span>
          )}
        </div>
      </div>
      {showUserMenu && (
        <div className="absolute top-full left-0 mt-2 w-48 py-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
          <button
            type="button"
            onClick={handleProfileClick}
            className="w-full px-4 py-2 text-right text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            الملف الشخصي
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
};
export default NavbarUserMenu;
