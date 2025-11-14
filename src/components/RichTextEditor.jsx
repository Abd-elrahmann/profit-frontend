// components/RichTextEditor.jsx
import React, { useRef, useEffect } from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

const RichTextEditor = ({ value, onChange, variables = [], height = "500px" }) => {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);
  const isInitialized = useRef(false);
  
  useEffect(() => {
    // فقط تحديث المحتوى عند التهيئة الأولى أو عند تغيير value من الخارج (ليس من المستخدم)
    if (editorRef.current && !isInternalChange.current) {
      const currentContent = editorRef.current.innerHTML;
      const newValue = value || '';
      
      // تحديث فقط إذا كان المحتوى مختلفاً
      if (currentContent !== newValue) {
        // حفظ موضع الـ cursor والـ selection
        const selection = window.getSelection();
        let cursorInfo = null;
        
        if (selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
          const range = selection.getRangeAt(0);
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(editorRef.current);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          cursorInfo = {
            offset: preCaretRange.toString().length,
            node: range.startContainer,
            nodeOffset: range.startOffset
          };
        }
        
        // تحديث المحتوى
        editorRef.current.innerHTML = newValue;
        
        // استعادة موضع الـ cursor
        if (cursorInfo && cursorInfo.offset > 0) {
          try {
            const range = document.createRange();
            const walker = document.createTreeWalker(
              editorRef.current,
              NodeFilter.SHOW_TEXT,
              null
            );
            
            let currentPos = 0;
            let targetNode = null;
            let targetOffset = 0;
            let node;
            
            while ((node = walker.nextNode())) {
              const nodeLength = node.textContent.length;
              if (currentPos + nodeLength >= cursorInfo.offset) {
                targetNode = node;
                targetOffset = cursorInfo.offset - currentPos;
                break;
              }
              currentPos += nodeLength;
            }
            
            if (targetNode) {
              range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent.length));
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } catch (e) {
            // إذا فشلت استعادة الموضع، لا نفعل شيء
          }
        }
      }
      
      if (!isInitialized.current) {
        isInitialized.current = true;
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
      // إعادة تعيين الـ flag بعد فترة قصيرة
      setTimeout(() => {
        isInternalChange.current = false;
      }, 0);
    }
  };

  const insertVariable = (variable) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const span = document.createElement('span');
        span.contentEditable = 'false';
        span.style.backgroundColor = '#e3f2fd';
        span.style.padding = '2px 6px';
        span.style.borderRadius = '4px';
        span.style.margin = '0 2px';
        span.style.color = '#1976d2';
        span.style.border = '1px solid #90caf9';
        span.textContent = variable;
        range.insertNode(span);
        
        // إضافة مسافة بعد المتغير
        const space = document.createTextNode(' ');
        range.insertNode(space);
        
        // تحديث المحتوى
        handleInput();
      }
    }
  };

  return (
    <Box sx={{ height }}>
      {/* شريط المتغيرات */}
      <Paper sx={{ p: 2, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Typography variant="subtitle2">إدراج متغير:</Typography>
        {variables.map((variable, index) => (
          <Button
            key={index}
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() => insertVariable(variable.key)}
            sx={{ fontSize: '0.75rem' }}
          >
            {variable.description || variable.key}
          </Button>
        ))}
      </Paper>

      {/* منطقة التحرير */}
      <Paper 
        sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: 1,
          height: 'calc(100% - 80px)'
        }}
      >
        <Box
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          sx={{
            height: '100%',
            padding: 2,
            overflow: 'auto',
            outline: 'none',
            fontFamily: '"Noto Sans Arabic", "Cairo", sans-serif',
            fontSize: '14px',
            lineHeight: 1.6,
            direction: 'rtl',
            textAlign: 'right'
          }}
        />
      </Paper>

      {/* شريط الأدوات البسيط */}
      <Paper sx={{ p: 1, mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => document.execCommand('bold', false, null)}
        >
          عريض
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => document.execCommand('italic', false, null)}
        >
          مائل
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => document.execCommand('underline', false, null)}
        >
          خط
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => document.execCommand('justifyRight', false, null)}
        >
          محاذاة لليمين
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => document.execCommand('insertUnorderedList', false, null)}
        >
          قائمة
        </Button>
      </Paper>
    </Box>
  );
};

export default RichTextEditor;