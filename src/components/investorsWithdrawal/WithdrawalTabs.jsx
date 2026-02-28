import React from "react";
import { Tabs, Tab, Box, FormControl, Select, MenuItem } from "@mui/material";
const TAB_CONFIG = [
  { label: "جدول السحب", value: 0 },
  { label: "التفاصيل", value: 1 },
];
const WithdrawalTabs = ({ value, onChange, isSmallScreen, selectedInvestorId }) => {
  const isDetailsDisabled = !selectedInvestorId;
  if (isSmallScreen) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", px: 2 }}>
        <FormControl sx={{ minWidth: 200, maxWidth: 320, width: "100%" }} size="small">
          <Select
            value={value}
            onChange={(e) => onChange(null, e.target.value)}
            sx={{ "& .MuiSelect-select": { textAlign: "center", py: 1.25 } }}
          >
            <MenuItem value={0}>{TAB_CONFIG[0].label}</MenuItem>
            <MenuItem value={1} disabled={isDetailsDisabled}>
              {TAB_CONFIG[1].label}
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
    );
  }
  return (
    <Tabs
      value={value}
      onChange={onChange}
      textColor="primary"
      indicatorColor="primary"
      sx={{
        px: 2,
        "& .MuiTab-root": {
          color: "text.primary",
          "&.Mui-selected": { color: "primary.main" },
        },
      }}
    >
      <Tab label={TAB_CONFIG[0].label} />
      <Tab label={TAB_CONFIG[1].label} disabled={isDetailsDisabled} />
    </Tabs>
  );
};
export default WithdrawalTabs;