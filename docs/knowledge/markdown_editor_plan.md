Here's a clear, step-by-step plan to replace your current Markdown renderer with **`@gravity-ui/markdown-editor`**, including Mermaid charts, KaTeX formulas, and XSS sanitization:

---

### **1. Installation**
```bash
npm install @gravity-ui/markdown-editor mermaid katex rehype-sanitize
```

---

### **2. Basic Editor Setup**
Create a wrapper component (e.g., `MarkdownEditor.tsx`):
```tsx
import { Editor } from '@gravity-ui/markdown-editor';
import '@gravity-ui/markdown-editor/styles.css';

const MarkdownEditor = () => {
  return (
    <Editor
      defaultMode="markup" // or "markdown"
      defaultValue="## Hello, world!"
      onChange={(value) => console.log(value)}
    />
  );
};
```

---

### **3. Add Mermaid Support**
#### **Step 3.1: Initialize Mermaid**
```tsx
import mermaid from 'mermaid';

// Initialize Mermaid (call this once)
mermaid.initialize({ startOnLoad: false, theme: 'default' });
```

#### **Step 3.2: Render Mermaid Blocks**
Use a custom renderer for code blocks labeled `mermaid`:
```tsx
<Editor
  // ...other props
  renderer={{
    code(code, language) {
      if (language === 'mermaid') {
        const container = document.createElement('div');
        mermaid.render('mermaid-svg', code, (svg) => {
          container.innerHTML = svg;
        });
        return container;
      }
      return <code>{code}</code>;
    },
  }}
/>
```

---

### **4. Add KaTeX Support**
#### **Step 4.1: Custom Math Renderer**
```tsx
import katex from 'katex';

<Editor
  // ...other props
  renderer={{
    math(code, isBlock) {
      const html = katex.renderToString(code, {
        displayMode: isBlock,
        throwOnError: false,
      });
      return <span dangerouslySetInnerHTML={{ __html: html }} />;
    },
  }}
/>
```

#### **Step 4.2: Enable Math Syntax**
Ensure your Markdown parser recognizes `$...$` (inline) and `$$...$$` (block) math:
```tsx
import { configure } from '@gravity-ui/markdown-editor';

configure({
  syntax: {
    math: true, // Enable $$...$$ and $...$ parsing
  },
});
```

---

### **5. XSS Sanitization with `rehype-sanitize`**
#### **Step 5.1: Define Sanitization Schema**
```tsx
import rehypeSanitize from 'rehype-sanitize';

<Editor
  // ...other props
  plugins={[
    [rehypeSanitize, {
      tagNames: ['h1', 'h2', 'code', 'pre', 'span', 'div', ...], // Allowed tags
      attributes: {
        '*': ['className'],
        span: ['style'], // Allow KaTeX styles
        div: ['id'], // Allow Mermaid container IDs
      },
    }]
  ]}
/>
```

#### **Step 5.2: Sanitize on Save**
For extra safety, sanitize the HTML output before saving:
```tsx
import { toHTML } from '@gravity-ui/markdown-editor';
import { unified } from 'unified';
import rehypeSanitize from 'rehype-sanitize';

const sanitizeHTML = async (html: string) => {
  const processor = unified().use(rehypeSanitize);
  return processor.process(html);
};

const handleSave = async (markdown: string) => {
  const html = toHTML(markdown);
  const sanitized = await sanitizeHTML(html);
  console.log(sanitized.value);
};
```

---

### **6. Replace Your Current Renderer**
Replace your `renderMarkdown` function with the editor component:
```tsx
// Before:
<div dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }} />

// After:
<MarkdownEditor defaultValue={markdown} onChange={handleSave} />
```

---

### **7. Full Example**
```tsx
import { Editor, configure } from '@gravity-ui/markdown-editor';
import '@gravity-ui/markdown-editor/styles.css';
import mermaid from 'mermaid';
import katex from 'katex';
import rehypeSanitize from 'rehype-sanitize';

// Initialize
mermaid.initialize({ startOnLoad: false });
configure({ syntax: { math: true } });

const SafeMarkdownEditor = ({ value }: { value: string }) => (
  <Editor
    defaultMode="markup"
    defaultValue={value}
    renderer={{
      code(code, language) {
        if (language === 'mermaid') {
          const container = document.createElement('div');
          mermaid.render('mermaid-svg', code, (svg) => {
            container.innerHTML = svg;
          });
          return container;
        }
        return <code>{code}</code>;
      },
      math(code, isBlock) {
        const html = katex.renderToString(code, {
          displayMode: isBlock,
          throwOnError: false,
        });
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
      },
    }}
    plugins={[[rehypeSanitize]]}
  />
);
```

---

### **Key Advantages Over Your Current Renderer**
1. **Native Table Support**: No regex hacks for tables.
2. **WYSIWYG Editing**: Edit tables/Mermaid visually.
3. **Extensible**: Add plugins for diagrams, emojis, etc.
4. **Secure**: Built-in XSS protection.

Let me know if you need help with specific edge cases (e.g., custom Mermaid themes)!
