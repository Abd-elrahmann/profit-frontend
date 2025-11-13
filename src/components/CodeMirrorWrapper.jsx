import React, { useRef, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';

const CodeMirrorWrapper = ({ 
  value, 
  onChange, 
  placeholder = "أدخل محتوى القالب هنا...",
  height = "500px",
  readOnly = false
}) => {
  const editorRef = useRef(null);
  const [extensions, setExtensions] = useState([]);

  // Load CodeMirror extensions dynamically
  useEffect(() => {
    const loadExtensions = async () => {
      const extensionsList = [];
      
      // Try to load HTML language support
      try {
        const htmlModule = await import('@codemirror/lang-html');
        extensionsList.push(htmlModule.html());
      } catch (e) {
        console.warn('@codemirror/lang-html not found, HTML syntax highlighting disabled');
      }
      
      // Try to load EditorView
      try {
        const viewModule = await import('@codemirror/view');
        extensionsList.push(
          viewModule.EditorView.lineWrapping,
          viewModule.EditorView.theme({
            '&': {
              fontSize: '14px',
              fontFamily: '"Cascadia Code", "Fira Code", "Consolas", "Monaco", monospace',
              direction: 'rtl',
              textAlign: 'right'
            },
            '.cm-content': {
              direction: 'rtl',
              textAlign: 'right',
              padding: '10px'
            },
            '.cm-editor': {
              height: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: '4px'
            },
            '.cm-scroller': {
              overflow: 'auto'
            },
            '.cm-gutters': {
              direction: 'ltr'
            }
          })
        );
      } catch (e) {
        console.warn('@codemirror/view not found, using basic setup');
      }
      
      setExtensions(extensionsList);
    };
    
    loadExtensions();
  }, []);

  return (
    <div style={{ 
      height: height,
      width: '100%',
      direction: 'rtl'
    }}>
      <CodeMirror
        ref={editorRef}
        value={value || ''}
        height={height}
        extensions={extensions}
        onChange={(val) => {
          if (onChange) {
            onChange(val);
          }
        }}
        placeholder={placeholder}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: true,
          searchKeymap: true,
          defaultKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true
        }}
      />
    </div>
  );
};

export default CodeMirrorWrapper;

