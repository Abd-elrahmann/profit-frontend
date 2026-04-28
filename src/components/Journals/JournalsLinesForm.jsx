import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { lookupAccounts } from "../../pages/Journals/journalsApi";
export default function JournalsLinesForm({
  currentLine,
  chartAccounts,
  editingLineIndex,
  journalLines,
  isReadOnly = false,
  onLineInputChange,
  onAddLine,
  onEditLine,
  onDeleteLine,
  onCancelLineEdit,
}) {
  const addRefs = useRef({});
  const lineInputClassName =
    "h-10 border border-outline-variant rounded-lg bg-white px-3 focus:ring-2 focus:ring-primary outline-none text-[15px]";
  const [accountInputValue, setAccountInputValue] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountResults, setAccountResults] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [didSelectAccount, setDidSelectAccount] = useState(false);
  const resultRowRefs = useRef([]);
  const resultsContainerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedAccount = useMemo(
    () => chartAccounts.find((acc) => String(acc.id) === String(currentLine.accountId)),
    [chartAccounts, currentLine.accountId]
  );

  useEffect(() => {
    if (selectedAccount && !isSearchModalOpen) {
      setAccountInputValue(`${selectedAccount.code} - ${selectedAccount.name}`);
    }
  }, [selectedAccount, isSearchModalOpen]);

  useEffect(() => {
    if (!isSearchModalOpen || highlightedIndex < 0) return;

    let row = resultRowRefs.current[highlightedIndex];
    const container = resultsContainerRef.current;

    if (!container) return;
    if (!row) {
      row = container.querySelector(`[data-index="${highlightedIndex}"]`);
    }
    if (!row) return;
  
    const rowTop = row.offsetTop;
    const rowBottom = rowTop + row.offsetHeight;
  
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
  
    // لو العنصر فوق الجزء الظاهر
    if (rowTop < containerTop) {
      container.scrollTop = rowTop;
    }
  
    // لو العنصر تحت الجزء الظاهر
    else if (rowBottom > containerBottom) {
      container.scrollTop = rowBottom - container.clientHeight;
    }

  }, [highlightedIndex, isSearchModalOpen, accountResults]);

  useEffect(() => {
    if (accountResults.length === 0) {
      setHighlightedIndex(-1);
      resultRowRefs.current = [];
      return;
    }
    setHighlightedIndex(0);
    resultRowRefs.current = [];
  }, [accountResults]);

  const runLookup = useCallback(async (term) => {
    try {
      setIsSearching(true);
      setSearchError("");
      const results = await lookupAccounts(term, 100);
      const normalizedResults = Array.isArray(results) ? results : [];
      setAccountResults(normalizedResults);
    } catch {
      setSearchError("تعذر تحميل نتائج البحث");
      setAccountResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const openSearchModal = async (term) => {
    const normalized = (term || "").trim();
    setDidSelectAccount(false);
    setSearchTerm(normalized);
    setIsSearchModalOpen(true);
    await runLookup(normalized);
  };

  const closeSearchModal = useCallback(() => {
    setIsSearchModalOpen(false);
    setHighlightedIndex(-1);
    if (!didSelectAccount && currentLine.accountId) {
      onLineInputChange("accountId", "");
    }
  }, [didSelectAccount, currentLine.accountId, onLineInputChange]);

  const handleDebitChange = (e) => {
    const val = e.target.value;
    if (val.includes("-")) return;
    onLineInputChange("debit", val);
  };
  const handleCreditChange = (e) => {
    const val = e.target.value;
    if (val.includes("-")) return;
    onLineInputChange("credit", val);
  };

  const focusField = useCallback((ref) => {
    setTimeout(() => ref?.focus?.(), 0);
  }, []);

  const setAddRef = (field) => (node) => {
    addRefs.current[field] = node;
  };

  const handleSubmitLine = (event) => {
    event?.preventDefault();
    onAddLine();
    focusField(addRefs.current.account);
  };

  const handleEnterKeyDown = (event, field) => {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const refs = addRefs.current;

    if (field === "account") {
      if (currentLine.accountId) {
        focusField(refs.debit);
        return;
      }
      openSearchModal(accountInputValue);
      return;
    }
    if (field === "debit") {
      if (currentLine.debit === "" || currentLine.debit === null || currentLine.debit === undefined) {
        onLineInputChange("debit", "0");
      }
      focusField(refs.credit);
      return;
    }
    if (field === "credit") {
      if (currentLine.credit === "" || currentLine.credit === null || currentLine.credit === undefined) {
        onLineInputChange("credit", "0");
      }
      focusField(refs.description);
      return;
    }

    handleSubmitLine(event);
  };

  const formatNumber = (value) =>
    value ? Math.round(Number(value)).toLocaleString() : "0";

  const handlePickAccount = useCallback((account) => {
    setDidSelectAccount(true);
    onLineInputChange("accountId", account.id);
    setAccountInputValue(`${account.code} - ${account.name}`);
    setIsSearchModalOpen(false);
    setHighlightedIndex(-1);
    focusField(addRefs.current.debit);
  }, [onLineInputChange, focusField]);

  const handleSearchNavigationKey = useCallback((e) => {
    if (!isSearchModalOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!accountResults.length) return;
      setHighlightedIndex((prev) =>
        prev < accountResults.length - 1 ? prev + 1 : 0
      );
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!accountResults.length) return;
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : accountResults.length - 1
      );
      return;
    }
    if (e.key === "Enter" && highlightedIndex >= 0 && accountResults[highlightedIndex]) {
      e.preventDefault();
      handlePickAccount(accountResults[highlightedIndex]);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      runLookup(searchTerm);
    }
  }, [
    isSearchModalOpen,
    accountResults,
    highlightedIndex,
    handlePickAccount,
    runLookup,
    searchTerm,
  ]);

  useEffect(() => {
    if (!isSearchModalOpen) return;

    const timer = setTimeout(() => {
      searchInputRef.current?.focus?.();
    }, 0);

    const handleWindowKeyDown = (event) => {
      if (!isSearchModalOpen) return;
      if (event.target === searchInputRef.current) return;
      if (["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) {
        handleSearchNavigationKey(event);
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [isSearchModalOpen, handleSearchNavigationKey]);

  const getAccountTypeLabel = (account) => {
    if (account?.accountBasicType) return account.accountBasicType;
    if (account?.nature === "DEBIT") return "مدين";
    if (account?.nature === "CREDIT") return "دائن";
    return "-";
  };

  return (
    <>
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0px_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-card-padding border-b border-outline-variant bg-[#f0fff4]">
        <h2 className="font-headline-sm text-headline-sm text-[#00174b]">بنود القيد</h2>
      </div>

      {!isReadOnly && (
        <div className="p-card-padding grid grid-cols-1 md:grid-cols-12 gap-gutter items-end bg-[#f8fbff] border-b border-outline-variant">
          <div className="md:col-span-4 flex flex-col gap-unit">
            <label className="font-label-md text-label-md text-on-surface-variant">الحساب</label>
            <input
              className={`${lineInputClassName} text-[15px] font-medium`}
              type="text"
              placeholder="اكتب اسم/كود الحساب ثم اضغط Enter"
              value={accountInputValue}
              onChange={(e) => {
                setAccountInputValue(e.target.value);
                if (currentLine.accountId) {
                  onLineInputChange("accountId", "");
                }
              }}
              onKeyDown={(event) => handleEnterKeyDown(event, "account")}
              ref={setAddRef("account")}
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-unit">
            <label className="font-label-md text-label-md text-on-surface-variant">مدين</label>
            <input
              className={`${lineInputClassName} text-left`}
              type="number"
              placeholder="0.00"
              value={currentLine.debit}
              onChange={handleDebitChange}
              onKeyDown={(event) => handleEnterKeyDown(event, "debit")}
              ref={setAddRef("debit")}
              min={0}
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-unit">
            <label className="font-label-md text-label-md text-on-surface-variant">دائن</label>
            <input
              className={`${lineInputClassName} text-left`}
              type="number"
              placeholder="0.00"
              value={currentLine.credit}
              onChange={handleCreditChange}
              onKeyDown={(event) => handleEnterKeyDown(event, "credit")}
              ref={setAddRef("credit")}
              min={0}
            />
          </div>

          <div className="md:col-span-4 flex flex-col gap-unit">
            <label className="font-label-md text-label-md text-on-surface-variant">وصف البند</label>
            <input
              className={`${lineInputClassName} text-[15px] font-medium`}
              type="text"
              placeholder="تفاصيل إضافية للبند..."
              value={currentLine.description}
              onChange={(e) => onLineInputChange("description", e.target.value)}
              onKeyDown={(event) => handleEnterKeyDown(event, "description")}
              ref={setAddRef("description")}
            />
          </div>

          {editingLineIndex !== null && (
            <div className="md:col-span-4">
              <button
                className="w-full h-10 border border-outline-variant rounded-lg text-on-surface-variant"
                onClick={onCancelLineEdit}
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f0fff4] border-b border-outline-variant">
              <th className="text-center p-4 font-label-md text-label-md text-[#00174b] w-12">#</th>
              <th className="text-center p-4 font-label-md text-label-md text-[#00174b]">رقم واسم الحساب</th>
              <th className="text-center p-4 font-label-md text-label-md text-[#00174b]">مدين</th>
              <th className="text-center p-4 font-label-md text-label-md text-[#00174b]">دائن</th>
              <th className="text-center p-4 font-label-md text-label-md text-[#00174b]">الوصف</th>
              {!isReadOnly && <th className="text-center p-4 font-label-md text-label-md text-[#00174b] w-24">إجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {journalLines.length === 0 ? (
              <tr>
                <td className="p-4 font-body-sm text-body-sm text-on-surface-variant text-center" colSpan={isReadOnly ? 5 : 6}>
                  لا توجد بنود مضافة
                </td>
              </tr>
            ) : (
              journalLines.map((line, index) => (
                <tr key={line.id || index} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4 font-body-sm text-body-sm text-on-surface-variant text-center">{index + 1}</td>
                  <td className="p-4 font-body-md text-body-md text-on-surface text-center">
                    {line.account?.code} - {line.account?.name}
                  </td>
                  <td className="p-4 font-body-md text-body-md text-primary text-center">{formatNumber(line.debit)}</td>
                  <td className="p-4 font-body-md text-body-md text-error text-center">{formatNumber(line.credit)}</td>
                  <td className="p-4 font-body-sm text-body-sm text-on-surface-variant text-center">{line.description || "-"}</td>
                  {!isReadOnly && (
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="text-green-600 hover:text-green-700 transition-colors px-2 py-1"
                          onClick={() => onEditLine(index)}
                          title="تعديل"
                          aria-label="تعديل"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700 transition-colors px-2 py-1"
                          onClick={() => onDeleteLine(index)}
                          title="حذف"
                          aria-label="حذف"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
    {isSearchModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        <div
          className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
          onClick={closeSearchModal}
        ></div>
        <div className="relative w-[min(86vw,820px)] bg-surface rounded-xl shadow-[0_32px_64px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[78vh]">
          <div className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface-bright">
            <h3 className="text-xl font-black text-on-surface tracking-tight">البحث عن حساب</h3>
            <button
              className="text-stone-400 hover:text-error transition-colors"
              onClick={closeSearchModal}
            >
              ✕
            </button>
          </div>

          <div className="px-6 pt-5 pb-3">
            <div className="relative group">
              <input
                ref={searchInputRef}
                className="w-full h-14 pr-4 pl-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-base focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="ابحث برقم الحساب أو الاسم..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchNavigationKey}
              />
            </div>
          </div>

          <div
            ref={resultsContainerRef}
            className="flex-1 overflow-y-scroll px-6 py-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-surface-container-low [&::-webkit-scrollbar-thumb]:bg-outline-variant [&::-webkit-scrollbar-thumb]:rounded-full"
          >
            <div className="border border-outline-variant/20 rounded-lg overflow-hidden">
              <table className="w-full text-right text-sm">
                <thead className="sticky top-0 bg-surface-container-low text-on-surface-variant z-10">
                  <tr>
                    <th className="py-3 px-6 font-bold text-xs text-center">كود الحساب</th>
                    <th className="py-3 px-6 font-bold text-xs text-center">اسم الحساب</th>
                    <th className="py-3 px-6 font-bold text-xs text-center">النوع</th>
                    <th className="py-3 px-6 font-bold text-xs text-center">الرصيد الحالي</th>
                    <th className="py-3 px-6 font-bold text-xs text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {isSearching ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-6 text-center text-on-surface-variant">
                        جاري البحث...
                      </td>
                    </tr>
                  ) : searchError ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-6 text-center text-error">
                        {searchError}
                      </td>
                    </tr>
                  ) : accountResults.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 px-6 text-center text-on-surface-variant">
                        لا توجد نتائج مطابقة
                      </td>
                    </tr>
                  ) : (
                    accountResults.map((account, index) => (
                      <tr
                        key={account.id}
                        data-index={index}
                        ref={(node) => {
                          resultRowRefs.current[index] = node;
                        }}
                        className={`group transition-all cursor-pointer ${
                          highlightedIndex === index
                            ? "bg-primary text-white"
                            : "hover:bg-primary"
                        }`}
                        onClick={() => handlePickAccount(account)}
                      >
                        <td className="py-4 px-6 font-mono font-bold group-hover:text-white text-center">
                          {account.code}
                        </td>
                        <td className="py-4 px-6 font-semibold group-hover:text-white text-center">
                          {account.name}
                        </td>
                        <td className="py-4 px-6 font-semibold group-hover:text-white text-center">
                          {getAccountTypeLabel(account)}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold group-hover:text-white text-center">
                          {formatNumber(account.balance || 0)}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            className="w-8 h-8 rounded-lg bg-primary-container text-on-primary group-hover:bg-white group-hover:text-primary transition-colors shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePickAccount(account);
                            }}
                          >
                            ↵
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
            <div className="text-xs text-stone-500">
              اكتب كلمة البحث واضغط Enter لعرض الحسابات المطابقة
            </div>
            <button
              className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant text-sm hover:bg-stone-200 transition-colors"
              onClick={closeSearchModal}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
