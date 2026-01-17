import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import {
  Print as PrintIcon,
  Share as ShareIcon,
  Download,
} from "@mui/icons-material";
import { notifySuccess, notifyError } from "../../utilities/toastify";

const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    try {
      link.download = decodeURIComponent(filename);
    } catch {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
    notifyError('حدث خطأ أثناء تحميل الملف');
  }
};

const extractFileName = (url) => {
  if (!url) return "ملف غير معروف";

  if (Array.isArray(url)) {
    if (url.length === 0) return "ملف غير معروف";
    url = url[0];
  }

  const parts = url.split("/");
  const encodedFileName = parts[parts.length - 1] || "ملف غير معروف";

  try {
    return decodeURIComponent(encodedFileName);
  } catch {
    return encodedFileName;
  }
};

const DocumentsModal = ({
  open,
  onClose,
  selectedDocumentsInstallment,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ textAlign: "center" }}>
        {" "}
        دفعة #{selectedDocumentsInstallment?.id}
      </DialogTitle>
      <DialogContent>
        {selectedDocumentsInstallment?.attachments &&
          selectedDocumentsInstallment.attachments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                المستندات المرفوعة:
              </Typography>
              {selectedDocumentsInstallment.attachments.map(
                (attachment, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                      p: 1,
                      borderRadius: 1,
                      mb: 1,
                    }}
                    onClick={() => {
                      window.open(attachment, "_blank");
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {extractFileName(attachment)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const response = await fetch(attachment);
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);

                            const iframe = document.createElement('iframe');
                            iframe.style.display = 'none';
                            iframe.src = url;
                            document.body.appendChild(iframe);

                            iframe.onload = () => {
                              iframe.contentWindow.print();
                              setTimeout(() => {
                                document.body.removeChild(iframe);
                                URL.revokeObjectURL(url);
                              }, 1000);
                            };
                          } catch (error) {
                            console.error('Print error:', error);
                            notifyError("حدث خطأ في الطباعة");
                          }
                        }}
                        title="طباعة"
                      >
                        <PrintIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const response = await fetch(attachment);
                            const blob = await response.blob();
                            const file = new File([blob], extractFileName(attachment), { type: blob.type });

                            if (navigator.share && navigator.canShare({ files: [file] })) {
                              await navigator.share({
                                title: extractFileName(attachment),
                                files: [file],
                              });
                            } else {
                              if (navigator.clipboard && navigator.clipboard.writeText) {
                                await navigator.clipboard.writeText(attachment);
                                notifySuccess("تم نسخ رابط الملف إلى الحافظة");
                              } else {
                                const textArea = document.createElement('textarea');
                                textArea.value = attachment;
                                document.body.appendChild(textArea);
                                textArea.select();
                                try {
                                  document.execCommand('copy');
                                  notifySuccess("تم نسخ رابط الملف إلى الحافظة");
                                } catch (err) {
                                  console.warn('Fallback copy method also failed:', err);
                                  notifyError("تعذرت نسخ رابط الملف تلقائياً — يرجى نسخه يدوياً");
                                } finally {
                                  document.body.removeChild(textArea);
                                }
                              }
                            }
                          } catch (error) {
                            console.error('Share error:', error);
                            notifyError("حدث خطأ في مشاركة الملف");
                          }
                        }}
                        title="مشاركة"
                      >
                        <ShareIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(attachment, extractFileName(attachment));
                        }}
                        title="تحميل"
                      >
                        <Download />
                      </IconButton>
                    </Box>
                  </Box>
                )
              )}
            </Box>
          )}

        {selectedDocumentsInstallment?.PaymentProof && (
          <Box>
            <Typography variant="h6" gutterBottom>
              إيصال الدفع:
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
                p: 1,
                borderRadius: 1,
              }}
              onClick={() => {
                window.open(
                  selectedDocumentsInstallment.PaymentProof,
                  "_blank"
                );
              }}
            >
              <Typography variant="body2" sx={{ flex: 1 }}>
                {extractFileName(selectedDocumentsInstallment.PaymentProof)}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const response = await fetch(selectedDocumentsInstallment.PaymentProof);
                      const blob = await response.blob();
                      const url = URL.createObjectURL(blob);

                      const iframe = document.createElement('iframe');
                      iframe.style.display = 'none';
                      iframe.src = url;
                      document.body.appendChild(iframe);

                      iframe.onload = () => {
                        iframe.contentWindow.print();
                        setTimeout(() => {
                          document.body.removeChild(iframe);
                          URL.revokeObjectURL(url);
                        }, 1000);
                      };
                    } catch (error) {
                      console.error('Print error:', error);
                      notifyError("حدث خطأ في الطباعة");
                    }
                  }}
                  title="طباعة"
                >
                  <PrintIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const response = await fetch(selectedDocumentsInstallment.PaymentProof);
                      const blob = await response.blob();
                      const file = new File([blob], extractFileName(selectedDocumentsInstallment.PaymentProof), { type: blob.type });

                      if (navigator.share && navigator.canShare({ files: [file] })) {
                        await navigator.share({
                          title: extractFileName(selectedDocumentsInstallment.PaymentProof),
                          files: [file],
                        });
                      } else {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(selectedDocumentsInstallment.PaymentProof);
                          notifySuccess("تم نسخ رابط الملف إلى الحافظة");
                        } else {  
                          const textArea = document.createElement('textarea');
                          textArea.value = selectedDocumentsInstallment.PaymentProof;
                          document.body.appendChild(textArea);
                          textArea.select();
                          try {
                            document.execCommand('copy');
                            notifySuccess("تم نسخ رابط الملف إلى الحافظة");
                          } catch (err) {
                            console.warn('Fallback copy method also failed:', err);
                            notifyError("تعذرت نسخ رابط الملف تلقائياً — يرجى نسخه يدوياً");
                          } finally {
                            document.body.removeChild(textArea);
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Share error:', error);
                      notifyError("حدث خطأ في مشاركة الملف");
                    }
                  }}
                  title="مشاركة"
                >
                  <ShareIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadFile(
                      selectedDocumentsInstallment.PaymentProof,
                      extractFileName(selectedDocumentsInstallment.PaymentProof)
                    );
                  }}
                  title="تحميل"
                >
                  <Download />
                </IconButton>
              </Box>
            </Box>
          </Box>
        )}

        {(!selectedDocumentsInstallment?.attachments ||
          selectedDocumentsInstallment.attachments.length === 0) &&
          !selectedDocumentsInstallment?.PaymentProof && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ py: 4 }}
            >
              لا توجد مستندات مرفوعة لهذه الدفعة
            </Typography>
          )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentsModal;