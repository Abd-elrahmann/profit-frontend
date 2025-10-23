import React, { useEffect, useRef, forwardRef } from 'react';
import ReactDOM from 'react-dom';

// Polyfill for findDOMNode to make ReactQuill work with React 19
if (!ReactDOM.findDOMNode) {
  ReactDOM.findDOMNode = (instance) => {
    if (instance == null) {
      return null;
    }
    if (instance.nodeType === 1) {
      return instance;
    }
    // For React components, try to get the DOM node
    if (instance._reactInternalFiber && instance._reactInternalFiber.stateNode) {
      return instance._reactInternalFiber.stateNode;
    }
    if (instance._reactInternals && instance._reactInternals.stateNode) {
      return instance._reactInternals.stateNode;
    }
    // Fallback for newer React versions
    if (instance.current) {
      return instance.current;
    }
    return instance;
  };
}

// Dynamic import to ensure the polyfill is loaded before ReactQuill
let ReactQuill = null;

const ReactQuillWrapper = forwardRef(({ value, onChange, placeholder, style, theme = "snow", ...props }, ref) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    const loadReactQuill = async () => {
      try {
        const { default: QuillComponent } = await import('react-quill');
        await import('react-quill/dist/quill.snow.css');
        ReactQuill = QuillComponent;
        setIsLoaded(true);

        // Add tooltips after Quill is loaded
        setTimeout(() => {
          const toolbar = document.querySelector('.ql-toolbar');
          if (toolbar) {
            // Headers
            toolbar.querySelector('.ql-header').setAttribute('title', 'حجم العنوان');
            
            // Font
            toolbar.querySelector('.ql-font').setAttribute('title', 'نوع الخط');
            
            // Size
            toolbar.querySelector('.ql-size').setAttribute('title', 'حجم الخط');
            
            // Bold
            toolbar.querySelector('.ql-bold').setAttribute('title', 'عريض');
            
            // Italic
            toolbar.querySelector('.ql-italic').setAttribute('title', 'مائل');
            
            // Underline
            toolbar.querySelector('.ql-underline').setAttribute('title', 'تحته خط');
            
            // Strike
            toolbar.querySelector('.ql-strike').setAttribute('title', 'يتوسطه خط');
            
            // Blockquote
            toolbar.querySelector('.ql-blockquote').setAttribute('title', 'اقتباس');
            
            // Color
            toolbar.querySelector('.ql-color').setAttribute('title', 'لون النص');
            
            // Background
            toolbar.querySelector('.ql-background').setAttribute('title', 'لون الخلفية');
            
            // Subscript
            toolbar.querySelector('.ql-script[value="sub"]').setAttribute('title', 'منخفض');
            
            // Superscript
            toolbar.querySelector('.ql-script[value="super"]').setAttribute('title', 'مرتفع');
            
            // Ordered List
            toolbar.querySelector('.ql-list[value="ordered"]').setAttribute('title', 'قائمة مرقمة');
            
            // Bullet List
            toolbar.querySelector('.ql-list[value="bullet"]').setAttribute('title', 'قائمة نقطية');
            
            // Decrease Indent
            toolbar.querySelector('.ql-indent[value="-1"]').setAttribute('title', 'تقليل المسافة البادئة');
            
            // Increase Indent
            toolbar.querySelector('.ql-indent[value="+1"]').setAttribute('title', 'زيادة المسافة البادئة');
            
            // Direction
            toolbar.querySelector('.ql-direction').setAttribute('title', 'اتجاه النص');
            
            // Align
            toolbar.querySelector('.ql-align').setAttribute('title', 'محاذاة');
            
            // Link
            toolbar.querySelector('.ql-link').setAttribute('title', 'رابط');
            
            // Image
            toolbar.querySelector('.ql-image').setAttribute('title', 'صورة');
            
            // Video
            toolbar.querySelector('.ql-video').setAttribute('title', 'فيديو');
            
            // Clean
            toolbar.querySelector('.ql-clean').setAttribute('title', 'مسح التنسيق');
          }
        }, 100);

      } catch (error) {
        console.error('Failed to load ReactQuill:', error);
      }
    };

    loadReactQuill();
  }, []);

  // Expose ref methods
  React.useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current?.getEditor(),
    getEditingArea: () => quillRef.current?.getEditingArea(),
    focus: () => quillRef.current?.focus(),
    blur: () => quillRef.current?.blur(),
  }));

  if (!isLoaded || !ReactQuill) {
    return (
      <div 
        style={{ 
          height: style?.height || '400px', 
          border: '1px solid #ccc',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f9f9f9',
          color: '#666',
          ...style
        }}
      >
        جاري تحميل المحرر...
      </div>
    );
  }

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        // Add custom handlers if needed
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'script', 'direction', 'align'
  ];

  return (
    <div style={{ direction: 'rtl' }}>
      <ReactQuill
        ref={quillRef}
        theme={theme}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={style}
        modules={modules}
        formats={formats}
        {...props}
      />
    </div>
  );
});

ReactQuillWrapper.displayName = 'ReactQuillWrapper';

export default ReactQuillWrapper;