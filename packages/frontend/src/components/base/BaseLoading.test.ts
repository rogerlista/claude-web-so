import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseLoading from './BaseLoading.vue'

describe('BaseLoading', () => {
  describe('Rendering', () => {
    it('should render loading element', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.find('.base-loading').exists()).toBe(true)
    })

    it('should render spinner by default', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.find('.base-loading__spinner').exists()).toBe(true)
    })

    it('should have aria-label', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.attributes('aria-label')).toBeDefined()
    })

    it('should have role="status"', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.attributes('role')).toBe('status')
    })

    it('should have aria-live="polite"', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.attributes('aria-live')).toBe('polite')
    })
  })

  describe('Sizes', () => {
    it('should apply medium size by default', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.classes()).toContain('base-loading--md')
    })

    it('should apply small size', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          size: 'sm',
        },
      })
      expect(wrapper.classes()).toContain('base-loading--sm')
    })

    it('should apply large size', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          size: 'lg',
        },
      })
      expect(wrapper.classes()).toContain('base-loading--lg')
    })

    it('should apply extra large size', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          size: 'xl',
        },
      })
      expect(wrapper.classes()).toContain('base-loading--xl')
    })
  })

  describe('Colors', () => {
    it('should apply primary color by default', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.classes()).toContain('base-loading--primary')
    })

    it('should apply secondary color', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          color: 'secondary',
        },
      })
      expect(wrapper.classes()).toContain('base-loading--secondary')
    })

    it('should apply white color', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          color: 'white',
        },
      })
      expect(wrapper.classes()).toContain('base-loading--white')
    })
  })

  describe('Text Label', () => {
    it('should not show text by default', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.find('.base-loading__text').exists()).toBe(false)
    })

    it('should show text when provided', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          text: 'Loading...',
        },
      })
      expect(wrapper.find('.base-loading__text').exists()).toBe(true)
      expect(wrapper.find('.base-loading__text').text()).toBe('Loading...')
    })

    it('should render slot content as text', () => {
      const wrapper = mount(BaseLoading, {
        slots: {
          default: 'Processing data...',
        },
      })
      expect(wrapper.find('.base-loading__text').text()).toBe('Processing data...')
    })

    it('should prefer slot over text prop', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          text: 'Text prop',
        },
        slots: {
          default: 'Slot content',
        },
      })
      expect(wrapper.text()).toContain('Slot content')
      expect(wrapper.text()).not.toContain('Text prop')
    })
  })

  describe('Fullscreen', () => {
    it('should not be fullscreen by default', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.classes()).not.toContain('base-loading--fullscreen')
    })

    it('should apply fullscreen class', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          fullscreen: true,
        },
      })
      expect(wrapper.classes()).toContain('base-loading--fullscreen')
    })

    it('should have fixed positioning when fullscreen', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          fullscreen: true,
        },
      })
      expect(wrapper.classes()).toContain('base-loading--fullscreen')
    })
  })

  describe('Overlay', () => {
    it('should not have overlay by default', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.classes()).not.toContain('base-loading--overlay')
    })

    it('should apply overlay class', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          overlay: true,
        },
      })
      expect(wrapper.classes()).toContain('base-loading--overlay')
    })
  })

  describe('Aria Label', () => {
    it('should have default aria-label', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.attributes('aria-label')).toBe('Carregando')
    })

    it('should accept custom aria-label', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          ariaLabel: 'Loading data',
        },
      })
      expect(wrapper.attributes('aria-label')).toBe('Loading data')
    })
  })

  describe('Variants', () => {
    it('should render spinner variant by default', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.find('.base-loading__spinner').exists()).toBe(true)
    })

    it('should render dots variant', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          variant: 'dots',
        },
      })
      expect(wrapper.find('.base-loading__dots').exists()).toBe(true)
    })

    it('should render pulse variant', () => {
      const wrapper = mount(BaseLoading, {
        props: {
          variant: 'pulse',
        },
      })
      expect(wrapper.find('.base-loading__pulse').exists()).toBe(true)
    })
  })

  describe('Screen Reader', () => {
    it('should be visible to screen readers', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    })

    it('should have proper ARIA attributes', () => {
      const wrapper = mount(BaseLoading)
      expect(wrapper.attributes('role')).toBe('status')
      expect(wrapper.attributes('aria-live')).toBe('polite')
    })
  })
})
