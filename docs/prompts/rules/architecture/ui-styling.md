# UI & Styling Guidelines

Comprehensive CSS standards, component architecture, and design system guidelines for the Roo Code VS Code Extension project.

## CSS Standards

### Primary Styling Approach
- **Primary**: Use Tailwind CSS classes over inline styles
- **Variables**: Add VSCode CSS variables to `webview-ui/src/index.css` before use
- **Example**: `<div className="text-md text-vscode-descriptionForeground mb-2" />`
- **Responsive**: Implement mobile-first responsive design
- **Accessibility**: Follow WCAG 2.1 AA standards

### VSCode CSS Variables Integration
```css
/* ✅ PREFERRED: VSCode theme integration in webview-ui/src/index.css */
:root {
  /* VSCode color variables */
  --vscode-foreground: var(--vscode-foreground);
  --vscode-background: var(--vscode-editor-background);
  --vscode-descriptionForeground: var(--vscode-descriptionForeground);
  --vscode-errorForeground: var(--vscode-errorForeground);
  --vscode-warningForeground: var(--vscode-warningForeground);
  --vscode-successForeground: var(--vscode-testing-iconPassed);
  
  /* Button colors */
  --vscode-button-background: var(--vscode-button-background);
  --vscode-button-foreground: var(--vscode-button-foreground);
  --vscode-button-hoverBackground: var(--vscode-button-hoverBackground);
  
  /* Input colors */
  --vscode-input-background: var(--vscode-input-background);
  --vscode-input-foreground: var(--vscode-input-foreground);
  --vscode-input-border: var(--vscode-input-border);
  
  /* Focus colors */
  --vscode-focusBorder: var(--vscode-focusBorder);
}

/* Tailwind custom utilities */
@layer utilities {
  .text-vscode-foreground {
    color: var(--vscode-foreground);
  }
  
  .text-vscode-description {
    color: var(--vscode-descriptionForeground);
  }
  
  .bg-vscode-background {
    background-color: var(--vscode-background);
  }
  
  .border-vscode-input {
    border-color: var(--vscode-input-border);
  }
  
  .focus-vscode {
    outline: 1px solid var(--vscode-focusBorder);
    outline-offset: -1px;
  }
}
```

### Responsive Design Patterns
```typescript
// ✅ PREFERRED: Mobile-first responsive design
const ResponsiveContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="
      w-full 
      px-4 sm:px-6 lg:px-8 
      py-4 sm:py-6 
      max-w-7xl 
      mx-auto
    ">
      {children}
    </div>
  );
};

const ResponsiveGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="
      grid 
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4 
      gap-4 sm:gap-6
    ">
      {children}
    </div>
  );
};
```

## Component Architecture

### Base Component Interface
```typescript
// ✅ PREFERRED: Consistent component interfaces
interface BaseComponentProps {
  className?: string;
  testId?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
}

interface ButtonProps extends BaseComponentProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  type?: 'button' | 'submit' | 'reset';
}

interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}
```

### Component Structure Pattern
```typescript
// ✅ PREFERRED: Consistent component structure
export const Button: React.FC<ButtonProps> = ({
  variant,
  size,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className,
  testId,
  'aria-label': ariaLabel,
  children
}) => {
  // Hooks at the top
  const [isPressed, setIsPressed] = useState(false);
  
  // Computed values
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-vscode';
  const variantClasses = getVariantClasses(variant);
  const sizeClasses = getSizeClasses(size);
  const stateClasses = getStateClasses({ disabled, loading, isPressed });
  
  // Event handlers
  const handleClick = useCallback(() => {
    if (!disabled && !loading) {
      onClick();
    }
  }, [disabled, loading, onClick]);

  const handleMouseDown = useCallback(() => setIsPressed(true), []);
  const handleMouseUp = useCallback(() => setIsPressed(false), []);
  const handleMouseLeave = useCallback(() => setIsPressed(false), []);

  // Render
  return (
    <button
      type={type}
      className={cn(baseClasses, variantClasses, sizeClasses, stateClasses, className)}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      data-testid={testId}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
    >
      {loading && <LoadingSpinner className="mr-2" />}
      {children}
    </button>
  );
};

// Helper functions
function getVariantClasses(variant: ButtonProps['variant']): string {
  const variants = {
    primary: 'bg-vscode-button-background text-vscode-button-foreground hover:bg-vscode-button-hoverBackground',
    secondary: 'bg-transparent border border-vscode-input-border text-vscode-foreground hover:bg-vscode-input-background',
    danger: 'bg-vscode-errorForeground text-white hover:opacity-90',
    ghost: 'bg-transparent text-vscode-foreground hover:bg-vscode-input-background'
  };
  
  return variants[variant];
}

function getSizeClasses(size: ButtonProps['size']): string {
  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  return sizes[size];
}

function getStateClasses({ disabled, loading, isPressed }: { 
  disabled: boolean; 
  loading: boolean; 
  isPressed: boolean; 
}): string {
  if (disabled || loading) {
    return 'opacity-50 cursor-not-allowed';
  }
  
  if (isPressed) {
    return 'scale-95';
  }
  
  return 'hover:scale-105 active:scale-95';
}
```

### Form Components
```typescript
// ✅ PREFERRED: Accessible form components
export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className,
  testId,
  'aria-label': ariaLabel
}) => {
  const inputId = useId();
  const errorId = error ? `${inputId}-error` : undefined;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <div className="w-full">
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={cn(
          'w-full px-3 py-2 rounded-md border transition-colors',
          'bg-vscode-input-background text-vscode-input-foreground border-vscode-input-border',
          'placeholder:text-vscode-description',
          'focus:outline-none focus-vscode',
          error && 'border-vscode-errorForeground',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        data-testid={testId}
        aria-label={ariaLabel}
        aria-invalid={!!error}
        aria-describedby={errorId}
      />
      {error && (
        <p
          id={errorId}
          className="mt-1 text-sm text-vscode-errorForeground"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required, error, children }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-vscode-foreground">
        {label}
        {required && <span className="text-vscode-errorForeground ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-vscode-errorForeground" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

## Accessibility Standards

### WCAG 2.1 AA Compliance
```typescript
// ✅ PREFERRED: Accessible component patterns
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  const titleId = useId();
  
  // Focus management
  useEffect(() => {
    if (isOpen) {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      firstElement?.focus();
    }
  }, [isOpen]);

  // Escape key handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal content */}
      <div className="relative bg-vscode-background border border-vscode-input-border rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-6">
          <h2 id={titleId} className="text-lg font-semibold text-vscode-foreground mb-4">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

// ✅ PREFERRED: Keyboard navigation support
export const Menu: React.FC<{
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
}> = ({ items, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[selectedIndex]);
        break;
      case 'Escape':
        e.preventDefault();
        // Close menu logic
        break;
    }
  }, [items, selectedIndex, onSelect]);

  return (
    <div
      ref={menuRef}
      role="menu"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="bg-vscode-background border border-vscode-input-border rounded-md shadow-lg py-1"
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          role="menuitem"
          className={cn(
            'w-full text-left px-4 py-2 text-sm transition-colors',
            'text-vscode-foreground hover:bg-vscode-input-background',
            index === selectedIndex && 'bg-vscode-input-background'
          )}
          onClick={() => onSelect(item)}
          aria-selected={index === selectedIndex}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};
```

## Design System Utilities

### Color System
```typescript
// ✅ PREFERRED: Consistent color utilities
export const colors = {
  // VSCode theme colors
  foreground: 'var(--vscode-foreground)',
  background: 'var(--vscode-background)',
  description: 'var(--vscode-descriptionForeground)',
  
  // Semantic colors
  error: 'var(--vscode-errorForeground)',
  warning: 'var(--vscode-warningForeground)',
  success: 'var(--vscode-testing-iconPassed)',
  info: 'var(--vscode-notificationsInfoIcon-foreground)',
  
  // Interactive colors
  button: {
    background: 'var(--vscode-button-background)',
    foreground: 'var(--vscode-button-foreground)',
    hover: 'var(--vscode-button-hoverBackground)'
  },
  
  input: {
    background: 'var(--vscode-input-background)',
    foreground: 'var(--vscode-input-foreground)',
    border: 'var(--vscode-input-border)'
  }
} as const;

export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem'    // 64px
} as const;

export const typography = {
  sizes: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem'  // 24px
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  }
} as const;
```

### Utility Functions
```typescript
// ✅ PREFERRED: Styling utility functions
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getResponsiveClasses(
  base: string,
  sm?: string,
  md?: string,
  lg?: string,
  xl?: string
): string {
  const classes = [base];
  
  if (sm) classes.push(`sm:${sm}`);
  if (md) classes.push(`md:${md}`);
  if (lg) classes.push(`lg:${lg}`);
  if (xl) classes.push(`xl:${xl}`);
  
  return classes.join(' ');
}

export function getFocusClasses(): string {
  return 'focus:outline-none focus-vscode';
}

export function getDisabledClasses(): string {
  return 'disabled:opacity-50 disabled:cursor-not-allowed';
}
```

## Best Practices Summary

### Do's
- ✅ Use Tailwind CSS classes over inline styles
- ✅ Integrate VSCode theme variables properly
- ✅ Follow mobile-first responsive design
- ✅ Implement WCAG 2.1 AA accessibility standards
- ✅ Use consistent component interfaces
- ✅ Provide proper focus management
- ✅ Include keyboard navigation support
- ✅ Use semantic HTML elements

### Don'ts
- ❌ Use inline styles for complex styling
- ❌ Ignore VSCode theme integration
- ❌ Skip accessibility considerations
- ❌ Create inconsistent component APIs
- ❌ Forget focus management in modals
- ❌ Use non-semantic HTML elements
- ❌ Ignore responsive design principles

## Related Documentation

- [VS Code Extension](vscode-extension.md) - Extension-specific UI considerations
- [Performance Standards](performance.md) - UI performance optimization
- [Development Principles](../core/development-principles.md) - Component architecture principles
- [Security & Privacy](../quality/security-privacy.md) - UI security considerations

---

*Consistent UI standards ensure a cohesive user experience that integrates seamlessly with the VS Code environment.*
