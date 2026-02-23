import React, { useEffect, useRef, forwardRef } from 'react';
import ReactDOM from 'react-dom';

if (!ReactDOM.findDOMNode) {
  ReactDOM.findDOMNode = (instance) => {
    if (instance == null) {
      return null;
    }
    if (instance.nodeType === 1) {
      return instance;
    }
    if (instance._reactInternalFiber && instance._reactInternalFiber.stateNode) {
      return instance._reactInternalFiber.stateNode;
    }
    if (instance._reactInternals && instance._reactInternals.stateNode) {
      return instance._reactInternals.stateNode;
    }
    if (instance.current) {
      return instance.current;
    }
    return instance;
  };
}

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

        setTimeout(() => {
          const toolbar = document.querySelector('.ql-toolbar');
          if (toolbar) {
            toolbar.querySelector('.ql-header').setAttribute('title', 'حجم العنوان');
            
            toolbar.querySelector('.ql-font').setAttribute('title', 'نوع الخط');
            
            toolbar.querySelector('.ql-size').setAttribute('title', 'حجم الخط');
            
            toolbar.querySelector('.ql-bold').setAttribute('title', 'عريض');
            
            toolbar.querySelector('.ql-underline').setAttribute('title', 'تحته خط');
            
            toolbar.querySelector('.ql-strike').setAttribute('title', 'يتوسطه خط');
            
            toolbar.querySelector('.ql-blockquote').setAttribute('title', 'اقتباس');
            
            toolbar.querySelector('.ql-color').setAttribute('title', 'لون النص');
            
            toolbar.querySelector('.ql-background').setAttribute('title', 'لون الخلفية');
            
            toolbar.querySelector('.ql-script[value="sub"]').setAttribute('title', 'منخفض');
            
            toolbar.querySelector('.ql-script[value="super"]').setAttribute('title', 'مرتفع');
            
            toolbar.querySelector('.ql-list[value="ordered"]').setAttribute('title', 'قائمة مرقمة');
            
            toolbar.querySelector('.ql-list[value="bullet"]').setAttribute('title', 'قائمة نقطية');
            
            toolbar.querySelector('.ql-indent[value="-1"]').setAttribute('title', 'تقليل المسافة البادئة');
            
            toolbar.querySelector('.ql-indent[value="+1"]').setAttribute('title', 'زيادة المسافة البادئة');
            
            toolbar.querySelector('.ql-direction').setAttribute('title', 'اتجاه النص');
            
            toolbar.querySelector('.ql-align').setAttribute('title', 'محاذاة');
            
            toolbar.querySelector('.ql-link').setAttribute('title', 'رابط');
            
            toolbar.querySelector('.ql-image').setAttribute('title', 'صورة');
            
            toolbar.querySelector('.ql-video').setAttribute('title', 'فيديو');

            toolbar.querySelector('.ql-clean').setAttribute('title', 'مسح التنسيق');
          }
        }, 100);

      } catch (error) {
        console.error('Failed to load ReactQuill:', error);
      }
    };

    loadReactQuill();
  }, []);

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
        ['bold', 'underline', 'strike', 'blockquote'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: { 
      }
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'underline', 'strike', 'blockquote',
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
