import React from "react";
import { Tabs, Tab, Box, FormControl, Select, MenuItem } from "@mui/material";
import { INVESTOR_TAB_LABELS } from "./investorsUtils";

const InvestorTabs = ({ value, onChange, isSmallScreen, availableTabs = null }) => {
  const tabs = availableTabs || INVESTOR_TAB_LABELS.map((label, idx) => ({ label, value: idx }));
  const currentValue = tabs.find(t => t.value === value)?.value ?? tabs[0]?.value ?? 0;

  if (isSmallScreen) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <FormControl sx={{ minWidth: 200, maxWidth: 320, width: "100%" }}>
          <Select
            value={currentValue}
            onChange={(e) => onChange(null, e.target.value)}
            size="small"
            sx={{ "& .MuiSelect-select": { textAlign: "center", py: 1.25 } }}
          >
            {tabs.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    );
  }
  return (
    <Tabs
      value={currentValue}
      onChange={onChange}
      textColor="primary"
      indicatorColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile={false}
      sx={{
        mb: 3,
        "& .MuiTab-root": {
          color: "text.primary",
          "&.Mui-selected": { color: "primary.main" },
        },
      }}
    >
      {tabs.map((t) => (
        <Tab key={t.value} label={t.label} value={t.value} />
      ))}
    </Tabs>
  );
};
export default InvestorTabs;
