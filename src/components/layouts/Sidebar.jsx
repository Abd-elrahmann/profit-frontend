import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MdExpandMore as ExpandMoreIcon, MdExpandLess as ExpandLessIcon } from 'react-icons/md';
import { getSidebarMenuItems } from '../../sidebar.config';
import { usePermissions } from '../Contexts/PermissionsContext';
import { usePrefetch } from '../../hooks/usePrefetch';
import { debounce } from '../../utilities/debounce';

const STORAGE_KEY = 'sidebarOpenGroup';

const linkBase =
  'flex flex-row-reverse justify-between items-center rounded-lg mb-1 py-2 px-3 no-underline transition-all duration-100 ease-out';
const linkSingle = `${linkBase} text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-sm hover:shadow-primary/20 hover:-translate-x-1 hover:scale-[1.02]`;
const linkActive =
  'bg-primary/15 dark:bg-primary/20 text-primary dark:text-primary relative before:content-[""] before:absolute before:right-0 before:top-0 before:h-full before:w-1 before:bg-primary before:rounded-l';

const Sidebar = ({ isOpen, onClose, isMobile = false, isSmallScreen = false, onHoverExpand }) => {
  const sidebarRef = useRef(null);
  const listRef = useRef(null);
  const location = useLocation();
  const [isHovering, setIsHovering] = useState(false);
  const [openGroup, setOpenGroupState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [filteredMenuItems, setFilteredMenuItems] = useState([]);
  const { permissions } = usePermissions();
  const { prefetchPage } = usePrefetch();

  const debouncedPrefetch = useMemo(
    () => debounce((module) => prefetchPage(module), 100),
    [prefetchPage]
  );

  const setOpenGroup = useCallback((valueOrUpdater) => {
    setOpenGroupState((prev) => {
      const value = typeof valueOrUpdater === 'function' ? valueOrUpdater(prev) : valueOrUpdater;
      try {
        if (value) {
          localStorage.setItem(STORAGE_KEY, value);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // ignore
      }
      return value;
    });
  }, []);

  const isExpanded = isOpen || isHovering;

  useEffect(() => {
    onHoverExpand?.(isHovering);
  }, [isHovering, onHoverExpand]);

  useEffect(() => () => onHoverExpand?.(false), [onHoverExpand]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('[data-sidebar-toggle]')) return;
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen && isMobile) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile, onClose]);

  const handleMouseEnter = useCallback(() => {
    if (!isMobile && !isOpen) {
      setIsHovering(true);
    }
  }, [isMobile, isOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile && !isOpen) {
      setIsHovering(false);
    }
  }, [isMobile, isOpen]);

  // Pre-filter menu: filter by permissions once, attach filtered children to groups
  useEffect(() => {
    const menuItems = getSidebarMenuItems();
    const filtered = menuItems
      .map((item) => {
        if (item.children) {
          const filteredChildren = item.children.filter(
            (child) => !child.requiresPermissions || permissions.includes(`${child.module}_View`)
          );
          if (filteredChildren.length === 0) return null;
          return { ...item, children: filteredChildren };
        }
        if (!item.requiresPermissions) return item;
        return permissions.includes(`${item.module}_View`) ? item : null;
      })
      .filter(Boolean);
    setFilteredMenuItems(filtered);
  }, [permissions]);

  // Auto-open group when current path matches a child
  useEffect(() => {
    const pathname = location.pathname;
    for (const item of filteredMenuItems) {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => pathname === child.path || pathname.startsWith(`${child.path}/`)
        );
        if (hasActiveChild) {
          setOpenGroup(item.label);
          return;
        }
      }
    }
  }, [location.pathname, filteredMenuItems, setOpenGroup]);

  const singleItems = useMemo(
    () => filteredMenuItems.filter((item) => !item.children),
    [filteredMenuItems]
  );
  const groupItems = useMemo(
    () => filteredMenuItems.filter((item) => item.children),
    [filteredMenuItems]
  );

  const toggleGroup = useCallback(
    (groupLabel) => {
      setOpenGroup((prev) => (prev === groupLabel ? null : groupLabel));
    },
    [setOpenGroup]
  );

  // Keyboard navigation
  useEffect(() => {
    const listEl = listRef.current;
    if (!isExpanded || !listEl) return;

    const items = listEl.querySelectorAll('a[href], button');
    const focusable = Array.from(items);

    const handleKeyDown = (e) => {
      if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) return;

      const currentIndex = focusable.findIndex((el) => el === document.activeElement);
      if (currentIndex === -1 && e.key !== 'Enter') return;

      e.preventDefault();

      if (e.key === 'ArrowDown') {
        const nextIndex = currentIndex < focusable.length - 1 ? currentIndex + 1 : 0;
        focusable[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
        focusable[prevIndex]?.focus();
      } else if (e.key === 'Enter' && document.activeElement?.tagName === 'BUTTON') {
        document.activeElement.click();
      }
    };

    listEl.addEventListener('keydown', handleKeyDown);
    return () => listEl.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded, singleItems, groupItems]);

  const renderSingleMenuItem = useCallback(
    (item, index) => (
      <li key={item.path} className={!isExpanded ? 'w-full' : ''}>
        <NavLink
          to={item.path}
          onClick={() => isMobile && onClose()}
          onMouseEnter={() => debouncedPrefetch(item.module)}
          title={item.label}
          className={({ isActive }) =>
            `${linkBase} ${index === 0 ? 'mt-1' : ''} ${
              isExpanded ? 'justify-between flex-row-reverse' : 'justify-center items-center'
            } text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:shadow-sm hover:shadow-primary/20 hover:-translate-x-1 hover:scale-[1.02] ${
              isActive ? linkActive : ''
            }`
          }
          style={{ transitionDelay: `${index * 20}ms` }}
        >
          {isExpanded && (
            <span className="flex-1 min-w-0 overflow-hidden text-right text-[0.95rem] font-semibold truncate">
              {item.label}
            </span>
          )}
          {item.icon && (
            <span
              className="flex shrink-0 justify-center text-[1rem] [&>svg]:w-[1em] [&>svg]:h-[1em]"
              style={{
                color: item.color || 'inherit',
                marginLeft: isExpanded ? '0.625rem' : 0,
              }}
            >
              <item.icon />
            </span>
          )}
        </NavLink>
      </li>
    ),
    [isExpanded, isMobile, onClose, debouncedPrefetch]
  );

  const renderGroupMenuItem = useCallback(
    (item, index) => {
      const isGroupOpen = openGroup === item.label;
      const { children: filteredChildren } = item;

      return (
        <li key={item.label} className={`mb-3 ${!isExpanded ? 'w-full' : ''}`}>
          <button
            type="button"
            onClick={() => isExpanded && toggleGroup(item.label)}
            title={item.label}
            className={`${linkBase} w-full cursor-pointer ${
              index === 0 && singleItems.length === 0 ? 'mt-1' : ''
            } ${
              isExpanded ? 'justify-between flex-row-reverse' : 'justify-center items-center'
            } text-slate-700 dark:text-slate-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary`}
            style={{ transitionDelay: `${index * 20}ms` }}
          >
            {isExpanded && (
              <span className="flex-1 min-w-0 overflow-hidden text-right text-[0.88rem] font-bold truncate">
                {item.label}
              </span>
            )}
            <div
              className={`flex items-center gap-1 ${isExpanded ? '' : 'justify-center'}`}
              style={{ marginLeft: isExpanded ? '0.625rem' : 0 }}
            >
              {item.icon && (
                <span
                  className="flex justify-center text-[1rem] [&>svg]:w-[1em] [&>svg]:h-[1em]"
                  style={{ color: item.color || 'inherit' }}
                >
                  <item.icon />
                </span>
              )}
              {isExpanded && (
                <span className="flex justify-center text-slate-600 dark:text-slate-400">
                  {isGroupOpen ? <ExpandLessIcon size={16} /> : <ExpandMoreIcon size={16} />}
                </span>
              )}
            </div>
          </button>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              isGroupOpen && isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <nav className="pr-2 mr-5">
                {filteredChildren.map((child, childIndex) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={() => isMobile && onClose()}
                    onMouseEnter={() => debouncedPrefetch(child.module)}
                    title={child.label}
                    className={({ isActive }) =>
                      `${linkSingle} pr-6 ${isExpanded ? 'opacity-100' : 'opacity-0'} ${
                        isActive ? linkActive : ''
                      }`
                    }
                    style={{ transitionDelay: `${childIndex * 20}ms` }}
                  >
                    {isExpanded && (
                      <span className="flex-1 min-w-0 overflow-hidden text-right text-[0.95rem] font-semibold truncate">
                        {child.label}
                      </span>
                    )}
                    <span
                      className="flex shrink-0 justify-center text-slate-500 dark:text-slate-400"
                      style={{ marginLeft: isExpanded ? '0.625rem' : 0 }}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                    </span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </li>
      );
    },
    [openGroup, isExpanded, singleItems, isMobile, onClose, toggleGroup, debouncedPrefetch]
  );

  const isHidden = isMobile && !isOpen;
  const expandedW = isSmallScreen ? 'w-[220px] min-w-[220px]' : 'w-64 min-w-64';
  const collapsedW = isSmallScreen ? 'w-14 min-w-14' : 'w-[70px] min-w-[70px]';
  const translateHidden = isSmallScreen ? '-translate-x-[220px]' : '-translate-x-64';
  const widthClass = isHidden
    ? `w-0 min-w-0 ${translateHidden} opacity-0`
    : isExpanded
      ? `${expandedW} opacity-100 translate-x-0 shadow-lg`
      : `${collapsedW} opacity-100 translate-x-0 shadow-md`;

  return (
    <aside
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        fixed top-16 right-0 bottom-0 z-[1200] flex flex-col shrink-0 overflow-hidden
        bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700
        transition-all duration-300 ease-out
        ${widthClass}
      `}
    >
      <div
        className={`
          h-full flex flex-col transition-all duration-300 ease-out
          ${isHidden ? 'opacity-0 translate-x-[50px]' : 'opacity-100 translate-x-0'}
          ${isExpanded ? (isSmallScreen ? 'w-[220px]' : 'w-64') : (isSmallScreen ? 'w-14' : 'w-[70px]')}
        `}
      >
        <ul
          ref={listRef}
          className={`flex-1 py-2 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isExpanded ? 'px-1' : 'px-2'
          }`}
          tabIndex={-1}
        >
          {singleItems.map((item, index) => renderSingleMenuItem(item, index))}
          {isExpanded && singleItems.length > 0 && groupItems.length > 0 && (
            <hr className="my-2 border-slate-200 dark:border-slate-700" />
          )}
          {groupItems.map((item, index) => renderGroupMenuItem(item, index))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
