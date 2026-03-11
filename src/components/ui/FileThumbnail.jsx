import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { InsertDriveFile } from "@mui/icons-material";
import { isImageFile, secureOpenFile, secureGetBlobUrl } from "../../utilities/fileUtils";
import { notifyError } from "../../utilities/toastify";

const isUploadsUrl = (url) => url && typeof url === "string" && url.includes("/uploads/");

export default function FileThumbnail({ fileUrl, label = "", isDarkMode = false, onClick }) {
  const [secureImgSrc, setSecureImgSrc] = useState(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!fileUrl || !isImageFile(fileUrl) || !isUploadsUrl(fileUrl)) return;
    let revoked = false;
    let blobUrl = null;
    secureGetBlobUrl(fileUrl)
      .then((url) => {
        blobUrl = url;
        if (!revoked) setSecureImgSrc(url);
      })
      .catch(() => {
        if (!revoked) setImgError(true);
      });
    return () => {
      revoked = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [fileUrl]);

  if (!fileUrl) return null;

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }
    try {
      if (isUploadsUrl(fileUrl)) {
        await secureOpenFile(fileUrl);
      } else {
        window.open(fileUrl, "_blank");
      }
    } catch (err) {
      notifyError(err.response?.data?.message || "لا يوجد صلاحية لعرض الملف");
    }
  };

  const imgSrc = isUploadsUrl(fileUrl) && isImageFile(fileUrl) ? secureImgSrc : fileUrl;

  if (isImageFile(fileUrl)) {
    if (imgError) {
      return (
        <Box
          sx={{
            width: "100%",
            height: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.hover",
            borderRadius: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            لا يمكن عرض الملف
          </Typography>
        </Box>
      );
    }
    return (
      <Box
        component="img"
        src={imgSrc}
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
