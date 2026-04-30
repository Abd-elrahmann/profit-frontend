import React from "react";

export default function AccountSearchModal({
  isOpen,
  onClose,
  searchInputRef,
  searchTerm,
  onSearchTermChange,
  onSearchNavigationKey,
  resultsContainerRef,
  accountResults,
  highlightedIndex,
  resultRowRefs,
  isSearching,
  searchError,
  onPickAccount,
  getAccountTypeLabel,
  formatNumber,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div
        className="absolute inset-0 bg-[#2d3133]/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-[min(72vw,680px)] bg-[#f7f9fb] rounded-xl shadow-[0_32px_64px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#c4c6d5]/20 bg-[#f7f9fb]">
          <h3 className="text-xl font-black text-[#191c1e] tracking-tight">البحث عن حساب</h3>
          <button
            className="text-stone-400 hover:text-[#ba1a1a] transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="px-6 pt-5 pb-3">
          <div className="relative group">
            <input
              ref={searchInputRef}
              className="w-full h-12 pr-4 pl-4 bg-white border border-[#c4c6d5]/30 rounded-xl text-base focus:ring-2 focus:ring-[#002b7a] focus:border-transparent transition-all outline-none"
              placeholder="ابحث برقم الحساب أو الاسم..."
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyDown={onSearchNavigationKey}
            />
          </div>
        </div>

        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-scroll px-6 py-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#f2f4f6] [&::-webkit-scrollbar-thumb]:bg-[#c4c6d5] [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          <div className="border border-[#c4c6d5]/20 rounded-lg overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="sticky top-0 bg-[#f2f4f6] text-[#434653] z-10">
                <tr>
                  <th className="py-3 px-6 font-bold text-xs text-center">كود الحساب</th>
                  <th className="py-3 px-6 font-bold text-xs text-center">اسم الحساب</th>
                  <th className="py-3 px-6 font-bold text-xs text-center">النوع</th>
                  <th className="py-3 px-6 font-bold text-xs text-center">الرصيد الحالي</th>
                  <th className="py-3 px-6 font-bold text-xs text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c6d5]/10">
                {isSearching ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-6 text-center text-[#434653]">
                      جاري البحث...
                    </td>
                  </tr>
                ) : searchError ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-6 text-center text-[#ba1a1a]">
                      {searchError}
                    </td>
                  </tr>
                ) : accountResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 px-6 text-center text-[#434653]">
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
                          ? "bg-[#002b7a] text-white"
                          : "hover:bg-[#002b7a]"
                      }`}
                      onClick={() => onPickAccount(account)}
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
                          className="w-8 h-8 rounded-lg bg-[#0d40a5] text-[#ffffff] group-hover:bg-white group-hover:text-[#002b7a] transition-colors shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPickAccount(account);
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

        <div className="px-6 py-4 border-t border-[#c4c6d5]/20 bg-[#f2f4f6] flex items-center justify-between">
          <div className="text-xs text-stone-500">
            اكتب كلمة البحث واضغط Enter لعرض الحسابات المطابقة
          </div>
          <button
            className="px-6 py-2.5 rounded-lg border border-[#c4c6d5] text-[#434653] text-sm hover:bg-stone-200 transition-colors"
            onClick={onClose}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
