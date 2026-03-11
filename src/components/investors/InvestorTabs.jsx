import React from "react";
import { Tabs, Tab, Box, FormControl, Select, MenuItem } from "@mui/material";
const TAB_LABELS = [
  "التفاصيل الشخصية",
  "المعلومات المالية",
  "العمليات المالية",
  "المستندات",
];
const InvestorTabs = ({ value, onChange, isSmallScreen }) => {
  if (isSmallScreen) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <FormControl sx={{ minWidth: 200, maxWidth: 320, width: "100%" }}>
          <Select
            value={value}
            onChange={(e) => onChange(null, e.target.value)}
            size="small"
            sx={{ "& .MuiSelect-select": { textAlign: "center", py: 1.25 } }}
          >
            {TAB_LABELS.map((label, idx) => (
              <MenuItem key={idx} value={idx}>
                {label}
              </MenuItem>
            ))}
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
      {TAB_LABELS.map((label, idx) => (
        <Tab key={idx} label={label} />
      ))}
    </Tabs>
  );
};
export default InvestorTabs;