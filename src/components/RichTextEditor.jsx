import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, Paper, Typography, Tooltip, Chip } from '@mui/material';
import { Add, Info } from '@mui/icons-material';

const RichTextEditor = ({ value, onChange, variables = [], height = "500px" }) => {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);
  const isInitialized = useRef(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      const currentContent = editorRef.current.innerHTML;
      const newValue = value || '';
      
      if (currentContent !== newValue) {
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
        
        editorRef.current.innerHTML = newValue;
        
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
          console.log(e);
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
        
        const variableSpan = document.createElement('span');
        variableSpan.contentEditable = 'false';
        variableSpan.className = 'template-variable';
        variableSpan.style.cssText = `
          background-color: #e3f2fd;
          padding: 2px 6px;
          border-radius: 4px;
          margin: 0 2px;
          color: #1976d2;
          border: 1px solid #90caf9;
          cursor: default;
          font-family: 'Cairo', sans-serif;
        `;
        variableSpan.textContent = variable;
        variableSpan.title = 'متغير - لا تقم بتغييره';
        
        // Add info icon
        const infoIcon = document.createElement('span');
        infoIcon.textContent = ' ⓘ';
        infoIcon.style.cssText = `
          font-size: 12px;
          opacity: 0.7;
          cursor: help;
        `;
        infoIcon.title = 'هذا متغير - لا تقم بتغييره';
        
        variableSpan.appendChild(infoIcon);
        range.insertNode(variableSpan);
        
        // Add space after variable
        const space = document.createTextNode(' ');
        range.insertNode(space);
        
        // Move cursor after the space
        range.setStartAfter(space);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        handleInput();
      }
    }
  };

  // Add event listeners for variable tooltips
  useEffect(() => {
    const handleMouseOver = (e) => {
      if (e.target.classList.contains('template-variable')) {
        setActiveTooltip(e.target.textContent.replace(' ⓘ', ''));
      }
    };

    const handleMouseOut = () => {
      setActiveTooltip(null);
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('mouseover', handleMouseOver);
      editor.addEventListener('mouseout', handleMouseOut);
    }

    return () => {
      if (editor) {
        editor.removeEventListener('mouseover', handleMouseOver);
        editor.removeEventListener('mouseout', handleMouseOut);
      }
    };
  }, []);

  return (
    <Box sx={{ height }}>
      {/* Variables Bar */}
      <Paper sx={{ p: 2, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Typography variant="subtitle2">إدراج متغير:</Typography>
        {variables.map((variable, index) => (
          <Tooltip key={index} title={`إدراج: ${variable.key}`} arrow>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() => insertVariable(variable.key)}
              sx={{ fontSize: '0.75rem' }}
            >
              {variable.description || variable.key}
            </Button>
          </Tooltip>
        ))}
      </Paper>

      {/* Editor Area */}
      <Paper 
        sx={{ 
          border: '1px solid #e0e0e0', 
          borderRadius: 1,
          height: 'calc(100% - 80px)',
          position: 'relative'
        }}
      >
        {/* Active Tooltip */}
        {activeTooltip && (
          <Box
            sx={{
              position: 'absolute',
              top: -40,
              left: 0,
              right: 0,
              bgcolor: 'info.main',
              color: 'white',
              p: 1,
              borderRadius: 1,
              textAlign: 'center',
              zIndex: 10,
              fontSize: '0.75rem'
            }}
          >
            ⓘ هذا متغير - لا تقم بتغييره: {activeTooltip}
          </Box>
        )}

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

      {/* Simple Toolbar */}
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