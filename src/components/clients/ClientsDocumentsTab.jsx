import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Button,
  IconButton,
} from "@mui/material";
import {
  Edit,
  Download,
  Share,
  Visibility,
  CheckCircle,
} from "@mui/icons-material";
import FileThumbnail from "../ui/FileThumbnail";
import { secureOpenFile } from "../../utilities/fileUtils";
import { notifyError } from "../../utilities/toastify";
import {
  CLIENT_DOCUMENT_TYPES,
  KAFEEL_DOCUMENT_TYPES,
  getOrdinalText,
} from "./clientsUtils";
function DocumentCard({
  doc,
  docType,
  clientName,
  isDarkMode,
  permissions,
  onDownload,
  onShare,
  onView,
}) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3} key={`${doc.key}-${doc.index}`}>
      <Paper
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "hidden",
        }}
        elevation={2}
      >
        <FileThumbnail
          fileUrl={doc.value}
          label={CLIENT_DOCUMENT_TYPES[docType]}
          isDarkMode={isDarkMode}
        />
        <Box sx={{ mt: 2 }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <CheckCircle color="success" fontSize="small" />
            <Typography fontWeight="500" variant="body2">
              {CLIENT_DOCUMENT_TYPES[docType]}
            </Typography>
          </Box>
          {permissions.includes("clients_Export") && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              <IconButton
                size="small"
                onClick={() =>
                  onDownload(
                    doc.value,
                    "",
                    CLIENT_DOCUMENT_TYPES[docType],
                    clientName
                  )
                }
                title="تحميل"
              >
                <Download fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(
                    doc.value,
                    CLIENT_DOCUMENT_TYPES[docType],
                    clientName
                  );
                }}
                title="مشاركة"
              >
                <Share fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onView(doc.value)}
                title="عرض"
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Paper>
    </Grid>
  );
}
const handleViewFile = async (url) => {
  try {
    await secureOpenFile(url);
  } catch {
    notifyError("لا يوجد صلاحية لعرض الملف");
  }
};
export default function ClientsDocumentsTab({
  clientDetails,
  documentsTab,
  permissions,
  isDarkMode,
  isMobile = false,
  onDocumentsTabChange,
  onEditDocuments,
  onEditKafeelDocuments,
  onDownloadFile,
  onShareFile,
}) {
  if (!clientDetails) return null;
  const client = clientDetails.client;
  const hasKafeel =
    (clientDetails.kafeels && clientDetails.kafeels.length > 0) ||
    clientDetails.kafeel;
  const processClientDocuments = () => {
    const clientGeneralDocs = [];
    const loanDocsById = {};
    clientDetails.documents?.forEach((doc, docIndex) => {
      Object.entries(doc).forEach(([key, value]) => {
        if (value && key !== "loanId") {
          if (
            ["clientIdImage", "clientWorkCard", "salaryReport", "simaReport"].includes(
              key
            )
          ) {
            clientGeneralDocs.push({ key, value, type: key, index: docIndex });
          } else if (
            ["DEBT_ACKNOWLEDGMENT", "PROMISSORY_NOTE", "SETTLEMENT"].includes(
              key
            )
          ) {
            const loanId = doc.loanId || "unknown";
            if (!loanDocsById[loanId]) loanDocsById[loanId] = [];
            loanDocsById[loanId].push({ key, value, type: key, index: docIndex });
          }
        }
      });
    });
    return { clientGeneralDocs, loanDocsById };
  };
  const { clientGeneralDocs, loanDocsById } = processClientDocuments();
  return (
    <Box>
      <Tabs
        value={documentsTab}
        onChange={(e, newValue) => onDocumentsTabChange(newValue)}
        textColor="primary"
        indicatorColor="primary"
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            color: "text.primary",
            "&.Mui-selected": { color: "primary.main" },
          },
        }}
      >
        <Tab label="مرفقات العميل" />
        {hasKafeel && <Tab label="مرفقات الكفيل" />}
      </Tabs>
      {documentsTab === 0 && (
        <Box>
          {clientDetails.documents && clientDetails.documents.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    مرفقات العميل
                  </Typography>
                  {permissions.includes("clients_Update") && (
                    <Button
                      variant="outlined"
                      startIcon={<Edit sx={{ marginLeft: "10px" }} />}
                      onClick={onEditDocuments}
                    >
                      تعديل مرفقات العميل
                    </Button>
                  )}
                </Box>
                {clientGeneralDocs.length > 0 ? (
                  <Grid container spacing={2}>
                    {clientGeneralDocs.map((doc) => (
                      <DocumentCard
                        key={`${doc.key}-${doc.index}`}
                        doc={doc}
                        docType={doc.key}
                        clientName={client.name}
                        isDarkMode={isDarkMode}
                        permissions={permissions}
                        onDownload={onDownloadFile}
                        onShare={onShareFile}
                        onView={handleViewFile}
                      />
                    ))}
                  </Grid>
                ) : (
                  <Typography color="text.secondary" sx={{ py: 2 }}>
                    لا توجد مرفقات عامة للعميل
                  </Typography>
                )}
              </Box>
              {Object.keys(loanDocsById).length > 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    color="primary"
                    mb={3}
                    textAlign="center"
                    fontWeight="bold"
                  >
                    مرفقات السلفات
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {Object.entries(loanDocsById).map(([loanId, docs], index) => (
                      <Box key={loanId}>
                        <Typography variant="h6" color="black" mb={2}>
                          مرفقات السلفة {getOrdinalText(index)}
                        </Typography>
                        <Grid container spacing={2}>
                          {docs.map((doc) => (
                            <DocumentCard
                              key={`${doc.key}-${doc.index}`}
                              doc={doc}
                              docType={doc.key}
                              clientName={client.name}
                              isDarkMode={isDarkMode}
                              permissions={permissions}
                              onDownload={onDownloadFile}
                              onShare={onShareFile}
                              onView={handleViewFile}
                            />
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" color="primary" fontWeight="bold">
                  مرفقات العميل
                </Typography>
                {permissions.includes("clients_Update") && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit sx={{ marginLeft: "10px" }} />}
                    onClick={onEditDocuments}
                  >
                    تعديل مرفقات العميل
                  </Button>
                )}
              </Box>
              <Paper sx={{ p: 3, textAlign: "center" }}>
                <Typography color="text.secondary">
                  لا توجد مستندات للعميل
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      )}
      {documentsTab === 1 && (
        <Box>
          {clientDetails.kafeels && clientDetails.kafeels.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {clientDetails.kafeels.map((kafeel, kafeelIndex) => {
                const kafeelDocuments = [
                  {
                    key: "kafeelIdImage",
                    value: kafeel.kafeelIdImage,
                    label: "صورة هوية الكفيل",
                  },
                  {
                    key: "kafeelWorkCard",
                    value: kafeel.kafeelWorkCard,
                    label: "بطاقة عمل الكفيل",
                  },
                ].filter((doc) => doc.value);
                return (
                  <Box key={kafeel.id || kafeelIndex}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" color="primary">
                        الكفيل {kafeelIndex + 1} - {kafeel.name}
                      </Typography>
                      {permissions.includes("clients_Update") && (
                        <Button
                          variant="outlined"
                          startIcon={<Edit sx={{ marginLeft: "10px" }} />}
                          onClick={() => onEditKafeelDocuments(kafeel)}
                        >
                          تعديل مرفقات الكفيل
                        </Button>
                      )}
                    </Box>
                    {kafeelDocuments.length > 0 ? (
                      <Grid container spacing={2}>
                        {kafeelDocuments.map((doc) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            key={doc.key}
                          >
                            <Paper
                              sx={{
                                p: 2,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                              elevation={2}
                            >
                              <FileThumbnail
                                fileUrl={doc.value}
                                label={doc.label}
                                isDarkMode={isDarkMode}
                              />
                              <Box sx={{ mt: 2 }}>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  mb={1}
                                >
                                  <CheckCircle
                                    color="success"
                                    fontSize="small"
                                  />
                                  <Typography
                                    fontWeight="500"
                                    variant="body2"
                                  >
                                    {doc.label}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 1,
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      onDownloadFile(
                                        doc.value,
                                        "",
                                        doc.label,
                                        client.name
                                      )
                                    }
                                    title="تحميل"
                                  >
                                    <Download fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onShareFile(
                                        doc.value,
                                        doc.label,
                                        client.name
                                      );
                                    }}
                                    title="مشاركة"
                                  >
                                    <Share fontSize="small" />
                                  </IconButton>
              <IconButton
                size="small"
                onClick={async () => {
                  try {
                    await secureOpenFile(doc.value);
                  } catch {
                    notifyError("لا يوجد صلاحية لعرض الملف");
                  }
                }}
                title="عرض"
              >
                <Visibility fontSize="small" />
              </IconButton>
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Paper sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          لا توجد مستندات للكفيل {kafeelIndex + 1}
                        </Typography>
                      </Paper>
                    )}
                    {kafeelIndex < clientDetails.kafeels.length - 1 && (
                      <Box
                        sx={{
                          borderBottom: "1px solid #e0e0e0",
                          my: 3,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          ) : clientDetails.kafeel ? (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" color="primary">
                  الكفيل
                </Typography>
                {permissions.includes("clients_Update") && (
                <Button
                  variant="outlined"
                  startIcon={<Edit sx={{ marginLeft: "10px" }} />}
                  onClick={() =>
                    onEditKafeelDocuments(clientDetails.kafeel)
                  }
                >
                  تعديل مرفقات الكفيل
                </Button>
                )}
              </Box>
              {clientDetails.documents &&
              clientDetails.documents.length > 0 ? (
                <Grid container spacing={2}>
                  {Object.entries(clientDetails.documents[0]).map(
                    ([key, value]) => {
                      if (value && KAFEEL_DOCUMENT_TYPES[key]) {
                        return (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            key={key}
                          >
                            <Paper
                              sx={{
                                p: 2,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                              elevation={2}
                            >
                              <FileThumbnail
                                fileUrl={value}
                                label={KAFEEL_DOCUMENT_TYPES[key]}
                                isDarkMode={isDarkMode}
                              />
                              <Box sx={{ mt: 2 }}>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  mb={1}
                                >
                                  <CheckCircle
                                    color="success"
                                    fontSize="small"
                                  />
                                  <Typography
                                    fontWeight="500"
                                    variant="body2"
                                  >
                                    {KAFEEL_DOCUMENT_TYPES[key]}
                                  </Typography>
                                </Box>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 1,
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      onDownloadFile(
                                        value,
                                        "",
                                        KAFEEL_DOCUMENT_TYPES[key],
                                        client.name
                                      )
                                    }
                                    title="تحميل"
                                  >
                                    <Download fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onShareFile(
                                        value,
                                        KAFEEL_DOCUMENT_TYPES[key],
                                        client.name
                                      );
                                    }}
                                    title="مشاركة"
                                  >
                                    <Share fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={async () => {
                                      try {
                                        await secureOpenFile(value);
                                      } catch {
                                        notifyError("لا يوجد صلاحية لعرض الملف");
                                      }
                                    }}
                                    title="عرض"
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </Paper>
                          </Grid>
                        );
                      }
                      return null;
                    }
                  )}
                </Grid>
              ) : (
                <Paper sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    لا توجد مستندات للكفيل
                  </Typography>
                </Paper>
              )}
            </Box>
          ) : (
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary">
                لا يوجد كفيل لهذا العميل
              </Typography>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}
