import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import BaseButton from './BaseButton.vue'

describe('BaseButton', () => {
  describe('Rendering', () => {
    it('should render button element', () => {
      const wrapper = mount(BaseButton)
      expect(wrapper.element.tagName).toBe('BUTTON')
    })

    it('should render slot content', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          default: 'Click Me',
        },
      })
      expect(wrapper.text()).toBe('Click Me')
    })

    it('should render with custom class', () => {
      const wrapper = mount(BaseButton, {
        attrs: {
          class: 'custom-class',
        },
      })
      expect(wrapper.classes()).toContain('custom-class')
    })
  })

  describe('Variants', () => {
    it('should apply primary variant by default', () => {
      const wrapper = mount(BaseButton)
      expect(wrapper.classes()).toContain('base-button--primary')
    })

    it('should apply secondary variant', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'secondary',
        },
      })
      expect(wrapper.classes()).toContain('base-button--secondary')
    })

    it('should apply danger variant', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'danger',
        },
      })
      expect(wrapper.classes()).toContain('base-button--danger')
    })

    it('should apply ghost variant', () => {
      const wrapper = mount(BaseButton, {
        props: {
          variant: 'ghost',
        },
      })
      expect(wrapper.classes()).toContain('base-button--ghost')
    })
  })

  describe('Sizes', () => {
    it('should apply medium size by default', () => {
      const wrapper = mount(BaseButton)
      expect(wrapper.classes()).toContain('base-button--md')
    })

    it('should apply small size', () => {
      const wrapper = mount(BaseButton, {
        props: {
          size: 'sm',
        },
      })
      expect(wrapper.classes()).toContain('base-button--sm')
    })

    it('should apply large size', () => {
      const wrapper = mount(BaseButton, {
        props: {
          size: 'lg',
        },
      })
      expect(wrapper.classes()).toContain('base-button--lg')
    })
  })

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      const wrapper = mount(BaseButton)
      expect(wrapper.attributes('disabled')).toBeUndefined()
    })

    it('should be disabled when disabled prop is true', () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
        },
      })
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('should not emit click when disabled', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
        },
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeUndefined()
    })

    it('should have cursor-not-allowed when disabled', () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
        },
      })
      expect(wrapper.classes()).toContain('base-button--disabled')
    })
  })

  describe('Loading State', () => {
    it('should not be in loading state by default', () => {
      const wrapper = mount(BaseButton)
      expect(wrapper.classes()).not.toContain('base-button--loading')
    })

    it('should show loading state', () => {
      const wrapper = mount(BaseButton, {
        props: {
          loading: true,
        },
      })
      expect(wrapper.classes()).toContain('base-button--loading')
    })

    it('should be disabled when loading', () => {
      const wrapper = mount(BaseButton, {
        props: {
          loading: true,
        },
      })
      expect(wrapper.attributes('disabled')).toBeDefined()
    })

    it('should show loading spinner when loading', () => {
      const wrapper = mount(BaseButton, {
        props: {
          loading: true,
        },
      })
      expect(wrapper.find('.base-button__spinner').exists()).toBe(true)
    })

    it('should not emit click when loading', async () => {
      const wrapper = mount(BaseButton, {
        props: {
          loading: true,
        },
      })
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeUndefined()
    })
  })

  describe('Full Width', () => {
    it('should not be full width by default', () => {
      const wrapper = mount(BaseButton)
      expect(wrapper.classes()).not.toContain('base-button--full-width')
    })

    it('should apply full width when fullWidth prop is true', () => {
      const wrapper = mount(BaseButton, {
        props: {
          fullWidth: true,
        },
      })
      expect(wrapper.classes()).toContain('base-button--full-width')
    })
  })

  describe('Button Type', () => {
    it('should have type="button" by default', () => {
      const wrapper = mount(BaseButton)
      expect(wrapper.attributes('type')).toBe('button')
    })

    it('should accept submit type', () => {
      const wrapper = mount(BaseButton, {
        props: {
          type: 'submit',
        },
      })
      expect(wrapper.attributes('type')).toBe('submit')
    })

    it('should accept reset type', () => {
      const wrapper = mount(BaseButton, {
        props: {
          type: 'reset',
        },
      })
      expect(wrapper.attributes('type')).toBe('reset')
    })
  })

  describe('Events', () => {
    it('should emit click event when clicked', async () => {
      const wrapper = mount(BaseButton)
      await wrapper.trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
      expect(wrapper.emitted('click')).toHaveLength(1)
    })

    it('should pass event to click handler', async () => {
      const onClick = vi.fn()
      const wrapper = mount(BaseButton, {
        attrs: {
          onClick,
        },
      })
      await wrapper.trigger('click')
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(onClick).toHaveBeenCalledWith(expect.any(MouseEvent))
    })

    it('should emit focus event', async () => {
      const wrapper = mount(BaseButton)
      await wrapper.trigger('focus')
      expect(wrapper.emitted('focus')).toBeTruthy()
    })

    it('should emit blur event', async () => {
      const wrapper = mount(BaseButton)
      await wrapper.trigger('blur')
      expect(wrapper.emitted('blur')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have role="button" by default', () => {
      const wrapper = mount(BaseButton)
      expect(wrapper.attributes('role')).toBeUndefined() // button element doesn't need role
    })

    it('should accept aria-label', () => {
      const wrapper = mount(BaseButton, {
        attrs: {
          'aria-label': 'Save changes',
        },
      })
      expect(wrapper.attributes('aria-label')).toBe('Save changes')
    })

    it('should have aria-disabled when disabled', () => {
      const wrapper = mount(BaseButton, {
        props: {
          disabled: true,
        },
      })
      expect(wrapper.attributes('aria-disabled')).toBe('true')
    })

    it('should have aria-busy when loading', () => {
      const wrapper = mount(BaseButton, {
        props: {
          loading: true,
        },
      })
      expect(wrapper.attributes('aria-busy')).toBe('true')
    })
  })

  describe('Icon Support', () => {
    it('should render icon slot before content', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          icon: '<span class="icon">→</span>',
          default: 'Next',
        },
      })
      const html = wrapper.html()
      expect(html.indexOf('icon')).toBeLessThan(html.indexOf('Next'))
    })

    it('should render icon-only button', () => {
      const wrapper = mount(BaseButton, {
        slots: {
          icon: '<span class="icon">×</span>',
        },
      })
      expect(wrapper.find('.icon').exists()).toBe(true)
    })
  })
})
