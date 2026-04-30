import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { lookupAccounts } from "../../pages/Journals/journalsApi";
import AccountSearchModal from "./AccountSearchModal";
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
    "h-10 border border-[#c4c6d5] rounded-lg bg-white px-3 focus:ring-2 focus:ring-[#002b7a] outline-none text-[15px]";
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
    setAccountInputValue("");
    onLineInputChange("accountId", "");
    onLineInputChange("debit", "");
    onLineInputChange("credit", "");
    onLineInputChange("description", "");
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
    <section className="bg-white rounded-xl border border-[#c4c6d5] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-5 border-b border-[#c4c6d5] bg-[#f0fff4]">
        <h2 className="text-[20px] leading-7 font-semibold text-[#00174b]">بنود القيد</h2>
      </div>

      {!isReadOnly && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-[#f8fbff] border-b border-[#c4c6d5]">
          <div className="md:col-span-4 flex flex-col gap-1">
            <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">الحساب</label>
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

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">مدين</label>
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

          <div className="md:col-span-2 flex flex-col gap-1">
            <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">دائن</label>
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

          <div className="md:col-span-4 flex flex-col gap-1">
            <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">وصف البند</label>
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
                className="w-full h-10 border border-[#c4c6d5] rounded-lg text-[#434653]"
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
            <tr className="bg-[#f0fff4] border-b border-[#c4c6d5]">
              <th className="text-center p-4 text-xs font-semibold leading-4 tracking-[0.05em] text-[#00174b] w-12">#</th>
              <th className="text-center p-4 text-xs font-semibold leading-4 tracking-[0.05em] text-[#00174b]">رقم واسم الحساب</th>
              <th className="text-center p-4 text-xs font-semibold leading-4 tracking-[0.05em] text-[#00174b]">مدين</th>
              <th className="text-center p-4 text-xs font-semibold leading-4 tracking-[0.05em] text-[#00174b]">دائن</th>
              <th className="text-center p-4 text-xs font-semibold leading-4 tracking-[0.05em] text-[#00174b]">الوصف</th>
              {!isReadOnly && <th className="text-center p-4 text-xs font-semibold leading-4 tracking-[0.05em] text-[#00174b] w-24">إجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c4c6d5]">
            {journalLines.length === 0 ? (
              <tr>
                <td className="p-4 text-[13px] leading-[18px] text-[#434653] text-center" colSpan={isReadOnly ? 5 : 6}>
                  لا توجد بنود مضافة
                </td>
              </tr>
            ) : (
              journalLines.map((line, index) => (
                <tr key={line.id || index} className="hover:bg-white transition-colors">
                  <td className="p-4 text-[13px] leading-[18px] text-[#434653] text-center">{index + 1}</td>
                  <td className="p-4 text-sm leading-5 text-[#191c1e] text-center">
                    {line.account?.code} - {line.account?.name}
                  </td>
                  <td className="p-4 text-sm leading-5 text-[#002b7a] text-center">{formatNumber(line.debit)}</td>
                  <td className="p-4 text-sm leading-5 text-[#ba1a1a] text-center">{formatNumber(line.credit)}</td>
                  <td className="p-4 text-[13px] leading-[18px] text-[#434653] text-center">{line.description || "-"}</td>
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
    <AccountSearchModal
      isOpen={isSearchModalOpen}
      onClose={closeSearchModal}
      searchInputRef={searchInputRef}
      searchTerm={searchTerm}
      onSearchTermChange={setSearchTerm}
      onSearchNavigationKey={handleSearchNavigationKey}
      resultsContainerRef={resultsContainerRef}
      accountResults={accountResults}
      highlightedIndex={highlightedIndex}
      resultRowRefs={resultRowRefs}
      isSearching={isSearching}
      searchError={searchError}
      onPickAccount={handlePickAccount}
      getAccountTypeLabel={getAccountTypeLabel}
      formatNumber={formatNumber}
    />
    </>
  );
}
