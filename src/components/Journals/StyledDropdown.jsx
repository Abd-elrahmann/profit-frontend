import React, { useEffect, useMemo, useRef, useState } from "react";

export default function StyledDropdown({
  value,
  options,
  onChange,
  placeholder = "اختر...",
  disabled = false,
  triggerClassName = "",
  panelClassName = "",
  optionClassName = "",
  onKeyDown,
  triggerRef,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const selected = useMemo(
    () => options.find((option) => String(option.value) === String(value)),
    [options, value]
  );

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        ref={triggerRef}
        onKeyDown={onKeyDown}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={`w-full text-right border border-outline-variant rounded-lg bg-white px-3 h-11 flex items-center justify-between gap-2 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed ${triggerClassName}`}
      >
        <span className={`truncate ${selected ? "text-on-surface" : "text-on-surface-variant"}`}>
          {selected?.label || placeholder}
        </span>
        <span className={`text-on-surface-variant transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-1 w-full rounded-lg border border-outline-variant bg-white shadow-lg max-h-64 overflow-auto ${panelClassName}`}
        >
          {options.map((option) => {
            const isSelected = String(option.value) === String(value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-right px-3 py-2 text-sm transition-colors ${
                  isSelected
                    ? "bg-primary-fixed text-on-primary-fixed font-semibold"
                    : "text-on-surface hover:bg-surface-container-low"
                } ${optionClassName}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
