# Design System - POS NFC-e

## Decisão: Componentes Customizados

### Por que componentes customizados?

Decidimos **criar componentes customizados** ao invés de usar bibliotecas UI prontas (Vuetify, PrimeVue, Element Plus) pelas seguintes razões:

1. **Performance**: Sem sobrecarga de bibliotecas grandes, apenas o código que realmente usamos
2. **Tamanho do Bundle**: Redução significativa do tamanho final da aplicação PWA
3. **Controle Total**: Controle completo sobre comportamento, estilos e acessibilidade
4. **Offline-First**: Componentes otimizados para funcionamento offline sem dependências externas
5. **Consistência**: Design system específico para PDV, sem adaptações forçadas
6. **Aprendizado**: Melhor compreensão dos padrões Vue.js e composables
7. **Manutenibilidade**: Código proprietário, mais fácil de manter e evoluir

### Tecnologias Utilizadas

- **Vue 3**: Composition API com `<script setup>`
- **TypeScript**: Tipagem estrita para todos os componentes
- **CSS Modules** ou **Scoped CSS**: Estilos isolados por componente
- **Headless UI** (opcional): Para lógica de acessibilidade complexa
- **VueUse**: Composables utilitários

---

## Paleta de Cores

### Cores Primárias

```css
:root {
  /* Primary - Azul para ações principais */
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;

  /* Success - Verde para confirmações */
  --color-success-50: #f0fdf4;
  --color-success-100: #dcfce7;
  --color-success-200: #bbf7d0;
  --color-success-300: #86efac;
  --color-success-400: #4ade80;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;
  --color-success-800: #166534;
  --color-success-900: #14532d;

  /* Warning - Amarelo para avisos */
  --color-warning-50: #fefce8;
  --color-warning-100: #fef9c3;
  --color-warning-200: #fef08a;
  --color-warning-300: #fde047;
  --color-warning-400: #facc15;
  --color-warning-500: #eab308;
  --color-warning-600: #ca8a04;
  --color-warning-700: #a16207;
  --color-warning-800: #854d0e;
  --color-warning-900: #713f12;

  /* Error - Vermelho para erros */
  --color-error-50: #fef2f2;
  --color-error-100: #fee2e2;
  --color-error-200: #fecaca;
  --color-error-300: #fca5a5;
  --color-error-400: #f87171;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  --color-error-700: #b91c1c;
  --color-error-800: #991b1b;
  --color-error-900: #7f1d1d;

  /* Neutral - Cinzas */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
}
```

### Cores de Background

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --bg-dark: #1f2937;
  --bg-darker: #111827;
}
```

### Cores de Texto

```css
:root {
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-on-dark: #ffffff;
  --text-on-primary: #ffffff;
}
```

---

## Tipografia

### Família de Fontes

```css
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}
```

### Tamanhos de Fonte

```css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
}
```

### Pesos de Fonte

```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

---

## Espaçamento

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

---

## Bordas e Raios

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;   /* 2px */
  --radius-base: 0.25rem;  /* 4px */
  --radius-md: 0.375rem;   /* 6px */
  --radius-lg: 0.5rem;     /* 8px */
  --radius-xl: 0.75rem;    /* 12px */
  --radius-2xl: 1rem;      /* 16px */
  --radius-full: 9999px;   /* circular */

  --border-width: 1px;
  --border-width-2: 2px;
  --border-width-4: 4px;
}
```

---

## Sombras

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-base: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
}
```

---

## Transições

```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Breakpoints (Mobile First)

```css
/* Mobile: < 640px (padrão) */
/* Tablet: >= 640px */
@media (min-width: 640px) { /* sm */ }

/* Tablet Large: >= 768px */
@media (min-width: 768px) { /* md */ }

/* Desktop: >= 1024px */
@media (min-width: 1024px) { /* lg */ }

/* Desktop Large: >= 1280px */
@media (min-width: 1280px) { /* xl */ }

/* Desktop XL: >= 1536px */
@media (min-width: 1536px) { /* 2xl */ }
```

---

## Z-Index Scale

```css
:root {
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-fixed: 1030;
  --z-modal-backdrop: 1040;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;
  --z-toast: 1080;
}
```

---

## Componentes Base

### Lista de Componentes a Implementar

1. **BaseButton** - Botão com variantes (primary, secondary, danger, ghost)
2. **BaseInput** - Input de texto com validação
3. **BaseSelect** - Select customizado
4. **BaseDialog** - Modal/Dialog acessível
5. **BaseTable** - Tabela de dados
6. **BaseCard** - Card container
7. **BaseAlert** - Notificações e alertas
8. **BaseLoading** - Spinner e skeleton loaders
9. **BaseCheckbox** - Checkbox customizado
10. **BaseRadio** - Radio button customizado
11. **BaseTextarea** - Textarea com contador
12. **BaseBadge** - Badge para status
13. **BaseTooltip** - Tooltip acessível
14. **BaseTabs** - Sistema de tabs

### Padrões de Nomenclatura

- Todos os componentes começam com `Base` (ex: `BaseButton.vue`)
- Props sempre tipadas com TypeScript
- Emits sempre declarados com `defineEmits<T>()`
- Exposição de refs com `defineExpose` quando necessário
- Usar Composition API com `<script setup lang="ts">`

### Estrutura de Arquivo

```
src/
├── components/
│   ├── base/
│   │   ├── BaseButton.vue
│   │   ├── BaseButton.test.ts
│   │   ├── BaseInput.vue
│   │   ├── BaseInput.test.ts
│   │   └── ...
│   └── layout/
│       ├── AppHeader.vue
│       ├── AppSidebar.vue
│       └── AppFooter.vue
├── composables/
│   ├── useToast.ts
│   ├── useModal.ts
│   └── useForm.ts
└── styles/
    ├── tokens.css (variáveis CSS)
    ├── reset.css
    └── utilities.css
```

---

## Acessibilidade (a11y)

### Diretrizes

1. **Navegação por Teclado**: Todos os componentes interativos devem ser acessíveis via teclado
2. **ARIA Labels**: Usar apropriadamente `aria-label`, `aria-labelledby`, `aria-describedby`
3. **Focus Visible**: Estados de foco visíveis e claros
4. **Contrast Ratio**: Mínimo WCAG AA (4.5:1 para texto normal)
5. **Screen Readers**: Testar com leitores de tela
6. **Semantic HTML**: Usar elementos semânticos (`<button>`, `<nav>`, etc.)

### Focus Styles

```css
:root {
  --focus-ring: 0 0 0 3px var(--color-primary-200);
  --focus-ring-offset: 2px;
}

*:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: var(--focus-ring-offset);
}
```

---

## Performance

### Otimizações

1. **Code Splitting**: Lazy load de componentes pesados
2. **Tree Shaking**: Importação nomeada de utilitários
3. **CSS Critical**: Inline de CSS crítico
4. **Preload**: Preload de fontes e assets essenciais
5. **Lazy Images**: Lazy loading de imagens
6. **Virtual Scrolling**: Para listas longas (produtos, vendas)

---

## Testing

### Estratégia de Testes

1. **Unit Tests**: Vitest para lógica de componentes
2. **Component Tests**: Testing Library para interações
3. **Visual Regression**: Snapshot tests para UI
4. **Accessibility Tests**: axe-core para validação a11y
5. **Coverage**: 100% de cobertura para componentes base

### Exemplo de Teste

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  it('should render button with text', () => {
    const wrapper = mount(BaseButton, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('should emit click event', async () => {
    const wrapper = mount(BaseButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('should be disabled when disabled prop is true', () => {
    const wrapper = mount(BaseButton, {
      props: { disabled: true }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})
```

---

## Documentação

Cada componente deve ter:

1. **Props Documentation**: JSDoc para todas as props
2. **Events Documentation**: Descrição de todos os eventos emitidos
3. **Usage Examples**: Exemplos de uso no README
4. **Storybook** (futuro): Stories interativas para cada componente

---

## Versionamento

- Seguir Semantic Versioning (SemVer)
- BREAKING CHANGES devem ser documentados
- Changelog mantido atualizado

---

## Referências

- [Vue 3 Style Guide](https://vuejs.org/style-guide/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inclusive Components](https://inclusive-components.design/)
- [Tailwind CSS](https://tailwindcss.com/) - Inspiração para tokens
- [Radix UI](https://www.radix-ui.com/) - Inspiração para acessibilidade
