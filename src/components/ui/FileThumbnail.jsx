import React from "react";
import { Box, Typography } from "@mui/material";
import { InsertDriveFile } from "@mui/icons-material";
import { isImageFile } from "../../utilities/fileUtils";
export default function FileThumbnail({ fileUrl, label = "", isDarkMode = false, onClick }) {
  if (!fileUrl) return null;
  const handleClick = () => (onClick ? onClick() : window.open(fileUrl, "_blank"));
  if (isImageFile(fileUrl)) {
    return (
      <Box
        component="img"
        src={fileUrl}
        alt={label}
        sx={{
          width: "100%",
          height: 180,
          objectFit: "cover",
          borderRadius: 1,
          cursor: "pointer",
          transition: "transform 0.2s",
          "&:hover": { transform: "scale(1.02)" },
        }}
        onClick={handleClick}
      />
    );
  }
  return (
    <Box
      sx={{
        width: "100%",
        height: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode ? "background.default" : "#f5f5f5",
        borderRadius: 1,
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
          backgroundColor: isDarkMode ? "action.hover" : "#e0e0e0",
        },
      }}
      onClick={handleClick}
    >
      <InsertDriveFile sx={{ fontSize: 60, color: "#757575" }} />
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        اضغط للعرض
      </Typography>
    </Box>
  );
}