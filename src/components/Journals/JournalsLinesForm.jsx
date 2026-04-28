import React, { useRef } from "react";
import {
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Stack,
  Button,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
export default function JournalsLinesForm({
  currentLine,
  chartAccounts,
  editingLineIndex,
  journalLines,
  isSmallScreen,
  isReadOnly = false,
  onLineInputChange,
  onAddLine,
  onEditLine,
  onDeleteLine,
  onCancelLineEdit,
}) {
  const isTabletOrSmaller = useMediaQuery("(max-width:1009px)");
  const isCompactLayout = isSmallScreen || isTabletOrSmaller;
  const tableCellAlign = isCompactLayout ? "right" : "center";
  const cellSpacingSx = {
    px: isCompactLayout ? 1 : 2,
    py: isCompactLayout ? 0.75 : 1.25,
  };
  const accountCellSx = {
    ...cellSpacingSx,
    pl: isCompactLayout ? 1.75 : 2.5,
  };
  const debitCellSx = {
    ...cellSpacingSx,
    pr: isCompactLayout ? 1.75 : 2.5,
  };

  const addRefs = useRef({
    account: null,
    debit: null,
    credit: null,
    description: null,
  });
  const editRefs = useRef({
    account: null,
    debit: null,
    credit: null,
    description: null,
  });

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

  const focusField = (ref) => {
    setTimeout(() => {
      if (!ref) return;
      if (typeof ref.focus === "function") {
        ref.focus();
        return;
      }
      ref?.current?.focus?.();
    }, 0);
  };

  const setAddRef = (field) => (node) => {
    addRefs.current[field] = node;
  };

  const setEditRef = (field) => (node) => {
    editRefs.current[field] = node;
  };

  const handleSubmitLine = (event) => {
    event?.preventDefault();
    onAddLine();
    if (editingLineIndex === null) {
      focusField(addRefs.current.account);
    } else {
      focusField(addRefs.current.account);
    }
  };

  const handleEnterKeyDown = (event, field, mode = "add") => {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const refs = mode === "edit" ? editRefs.current : addRefs.current;

    if (field === "account") {
      focusField(refs.debit);
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

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
        {isReadOnly
          ? "بنود القيد"
          : editingLineIndex !== null
          ? "تعديل البند"
          : "إضافة بند جديد"}
      </Typography>
      <TableContainer
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
          scrollbarGutter: "stable",
          "&::-webkit-scrollbar": {
            height: 10,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0,0,0,0.08)",
            borderRadius: 8,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(13,64,165,0.45)",
            borderRadius: 8,
          },
        }}
      >
        <Table
          size={isCompactLayout ? "small" : "medium"}
          sx={{
            width: "100%",
            minWidth: isCompactLayout ? 980 : "100%",
            tableLayout: isCompactLayout ? "fixed" : "auto",
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                align={tableCellAlign}
                sx={{
                  fontWeight: "bold",
                  width: isCompactLayout ? "30%" : "32%",
                  minWidth: isCompactLayout ? 200 : 320,
                  ...accountCellSx,
                }}
              >
                الحساب
              </TableCell>
              <TableCell
                align={tableCellAlign}
                sx={{ fontWeight: "bold", minWidth: isCompactLayout ? 95 : 130, ...debitCellSx }}
              >
                مدين
              </TableCell>
              <TableCell
                align={tableCellAlign}
                sx={{ fontWeight: "bold", minWidth: isCompactLayout ? 95 : 130, ...cellSpacingSx }}
              >
                دائن
              </TableCell>
              <TableCell
                align={tableCellAlign}
                sx={{ fontWeight: "bold", minWidth: isCompactLayout ? 120 : 180, ...cellSpacingSx }}
              >
                الوصف
              </TableCell>
              {!isReadOnly && (
                <TableCell
                  align={tableCellAlign}
                  sx={{ fontWeight: "bold", minWidth: isCompactLayout ? 90 : 140, ...cellSpacingSx }}
                >
                  الإجراءات
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {journalLines.length === 0 && (
              <TableRow>
                <TableCell align={tableCellAlign} colSpan={isReadOnly ? 4 : 5}>
                  لا توجد بنود مضافة
                </TableCell>
              </TableRow>
            )}
            {journalLines.map((line, index) => (
              <TableRow key={line.id || index}>
                {editingLineIndex === index && !isReadOnly ? (
                  <>
                    <TableCell
                      sx={{
                        width: isCompactLayout ? "30%" : "32%",
                        minWidth: isCompactLayout ? 200 : 320,
                        ...accountCellSx,
                      }}
                    >
                      <Autocomplete
                        sx={{ width: "100%", minWidth: isCompactLayout ? 200 : 320 }}
                        options={chartAccounts}
                        getOptionLabel={(option) => `${option.code} - ${option.name}`}
                        value={
                          chartAccounts.find((acc) => acc.id === currentLine.accountId) ||
                          null
                        }
                        onChange={(event, newValue) => {
                          onLineInputChange("accountId", newValue?.id || "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="الحساب"
                            required
                            variant="outlined"
                            inputRef={setEditRef("account")}
                            onKeyDown={(event) => handleEnterKeyDown(event, "account", "edit")}
                          />
                        )}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: isCompactLayout ? 95 : 130, ...debitCellSx }}>
                      <TextField
                        fullWidth
                        label="مدين"
                        type="number"
                        value={currentLine.debit}
                        onChange={handleDebitChange}
                        onKeyDown={(event) => handleEnterKeyDown(event, "debit", "edit")}
                        inputRef={setEditRef("debit")}
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: isCompactLayout ? 95 : 130, ...cellSpacingSx }}>
                      <TextField
                        fullWidth
                        label="دائن"
                        type="number"
                        value={currentLine.credit}
                        onChange={handleCreditChange}
                        onKeyDown={(event) => handleEnterKeyDown(event, "credit", "edit")}
                        inputRef={setEditRef("credit")}
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: isCompactLayout ? 120 : 180, ...cellSpacingSx }}>
                      <TextField
                        fullWidth
                        label="الوصف"
                        value={currentLine.description}
                        onChange={(e) => onLineInputChange("description", e.target.value)}
                        onKeyDown={(event) => handleEnterKeyDown(event, "description", "edit")}
                        inputRef={setEditRef("description")}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: isCompactLayout ? 90 : 140, ...cellSpacingSx }}>
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          sx={{ fontWeight: "bold" }}
                          variant="contained"
                          startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
                          onClick={handleSubmitLine}
                          size={isCompactLayout ? "medium" : "small"}
                        >
                          {isCompactLayout ? "حفظ" : "تحديث"}
                        </Button>
                        <IconButton size="small" color="default" onClick={onCancelLineEdit}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell
                      align={tableCellAlign}
                      sx={{
                        width: isCompactLayout ? "30%" : "32%",
                        minWidth: isCompactLayout ? 200 : 320,
                        ...accountCellSx,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {line.account?.code} - {line.account?.name}
                    </TableCell>
                    <TableCell align={tableCellAlign} sx={{ minWidth: isCompactLayout ? 95 : 130, ...debitCellSx }}>
                      {formatNumber(line.debit)}
                    </TableCell>
                    <TableCell align={tableCellAlign} sx={{ minWidth: isCompactLayout ? 95 : 130, ...cellSpacingSx }}>
                      {formatNumber(line.credit)}
                    </TableCell>
                    <TableCell align={tableCellAlign} sx={{ minWidth: isCompactLayout ? 120 : 180, ...cellSpacingSx }}>
                      {line.description || "-"}
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell align="center" sx={{ minWidth: isCompactLayout ? 90 : 140, ...cellSpacingSx }}>
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="تعديل">
                            <IconButton size="small" color="primary" onClick={() => onEditLine(index)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton size="small" color="error" onClick={() => onDeleteLine(index)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    )}
                  </>
                )}
              </TableRow>
            ))}
            {!isReadOnly && editingLineIndex === null && (
            <TableRow>
              <TableCell
                sx={{
                  width: isCompactLayout ? "30%" : "32%",
                  minWidth: isCompactLayout ? 200 : 320,
                  ...accountCellSx,
                }}
              >
                <Autocomplete
                  sx={{ width: "100%", minWidth: isCompactLayout ? 200 : 320 }}
                  options={chartAccounts}
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  value={
                    chartAccounts.find((acc) => acc.id === currentLine.accountId) ||
                    null
                  }
                  onChange={(event, newValue) => {
                    onLineInputChange("accountId", newValue?.id || "");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="الحساب"
                      required
                      variant="outlined"
                      inputRef={setAddRef("account")}
                      onKeyDown={(event) => handleEnterKeyDown(event, "account", "add")}
                    />
                  )}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                />
              </TableCell>
              <TableCell sx={{ minWidth: isCompactLayout ? 95 : 130, ...debitCellSx }}>
                <TextField
                  fullWidth
                  label="مدين"
                  type="number"
                  value={currentLine.debit}
                  onChange={handleDebitChange}
                  onKeyDown={(event) => handleEnterKeyDown(event, "debit", "add")}
                  inputRef={setAddRef("debit")}
                  inputProps={{ min: 0 }}
                />
              </TableCell>
              <TableCell sx={{ minWidth: isCompactLayout ? 95 : 130, ...cellSpacingSx }}>
                <TextField
                  fullWidth
                  label="دائن"
                  type="number"
                  value={currentLine.credit}
                  onChange={handleCreditChange}
                  onKeyDown={(event) => handleEnterKeyDown(event, "credit", "add")}
                  inputRef={setAddRef("credit")}
                  inputProps={{ min: 0 }}
                />
              </TableCell>
              <TableCell sx={{ minWidth: isCompactLayout ? 120 : 180, ...cellSpacingSx }}>
                <TextField
                  fullWidth
                  label="الوصف"
                  value={currentLine.description}
                  onChange={(e) => onLineInputChange("description", e.target.value)}
                  onKeyDown={(event) => handleEnterKeyDown(event, "description", "add")}
                  inputRef={setAddRef("description")}
                />
              </TableCell>
              <TableCell align="center" sx={{ minWidth: isCompactLayout ? 90 : 140, ...cellSpacingSx }}>
                {!isCompactLayout && (
                  <Button
                    sx={{ fontWeight: "bold" }}
                    variant="contained"
                    startIcon={
                      editingLineIndex !== null ? (
                        <SaveIcon sx={{ marginLeft: "10px" }} />
                      ) : (
                        <AddIcon sx={{ marginLeft: "10px" }} />
                      )
                    }
                    onClick={handleSubmitLine}
                    size="small"
                  >
                    {editingLineIndex !== null ? "تحديث" : "إضافة"}
                  </Button>
                )}
              </TableCell>
            </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
