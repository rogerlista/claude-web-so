import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseAlert from './BaseAlert.vue'

describe('BaseAlert', () => {
  describe('Rendering', () => {
    it('should render alert element', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.find('.base-alert').exists()).toBe(true)
    })

    it('should render message', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          message: 'This is an alert',
        },
      })
      expect(wrapper.text()).toContain('This is an alert')
    })

    it('should render slot content', () => {
      const wrapper = mount(BaseAlert, {
        slots: {
          default: '<p>Custom content</p>',
        },
      })
      expect(wrapper.html()).toContain('Custom content')
    })

    it('should prefer slot over message prop', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          message: 'Message prop',
        },
        slots: {
          default: '<p>Slot content</p>',
        },
      })
      expect(wrapper.html()).toContain('Slot content')
      expect(wrapper.html()).not.toContain('Message prop')
    })
  })

  describe('Variants', () => {
    it('should apply info variant by default', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.find('.base-alert').classes()).toContain('base-alert--info')
    })

    it('should apply success variant', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          variant: 'success',
        },
      })
      expect(wrapper.find('.base-alert').classes()).toContain('base-alert--success')
    })

    it('should apply warning variant', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          variant: 'warning',
        },
      })
      expect(wrapper.find('.base-alert').classes()).toContain('base-alert--warning')
    })

    it('should apply error variant', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          variant: 'error',
        },
      })
      expect(wrapper.find('.base-alert').classes()).toContain('base-alert--error')
    })
  })

  describe('Title', () => {
    it('should not render title by default', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.find('.base-alert__title').exists()).toBe(false)
    })

    it('should render title when provided', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          title: 'Alert Title',
        },
      })
      expect(wrapper.find('.base-alert__title').exists()).toBe(true)
      expect(wrapper.find('.base-alert__title').text()).toBe('Alert Title')
    })
  })

  describe('Dismissible', () => {
    it('should not be dismissible by default', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.find('.base-alert__close').exists()).toBe(false)
    })

    it('should show close button when dismissible', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          dismissible: true,
        },
      })
      expect(wrapper.find('.base-alert__close').exists()).toBe(true)
    })

    it('should emit close event when close button is clicked', async () => {
      const wrapper = mount(BaseAlert, {
        props: {
          dismissible: true,
        },
      })
      await wrapper.find('.base-alert__close').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should hide alert after close button is clicked', async () => {
      const wrapper = mount(BaseAlert, {
        props: {
          dismissible: true,
        },
      })
      await wrapper.find('.base-alert__close').trigger('click')
      expect(wrapper.find('.base-alert').exists()).toBe(false)
    })
  })

  describe('Model Value', () => {
    it('should be visible by default', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.find('.base-alert').exists()).toBe(true)
    })

    it('should be hidden when modelValue is false', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          modelValue: false,
        },
      })
      expect(wrapper.find('.base-alert').exists()).toBe(false)
    })

    it('should emit update:modelValue when closed', async () => {
      const wrapper = mount(BaseAlert, {
        props: {
          modelValue: true,
          dismissible: true,
        },
      })
      await wrapper.find('.base-alert__close').trigger('click')
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    })

    it('should show alert when modelValue changes to true', async () => {
      const wrapper = mount(BaseAlert, {
        props: {
          modelValue: false,
        },
      })
      expect(wrapper.find('.base-alert').exists()).toBe(false)
      await wrapper.setProps({ modelValue: true })
      expect(wrapper.find('.base-alert').exists()).toBe(true)
    })
  })

  describe('Icon', () => {
    it('should not show icon by default', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.find('.base-alert__icon').exists()).toBe(false)
    })

    it('should show icon when showIcon is true', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          showIcon: true,
        },
      })
      expect(wrapper.find('.base-alert__icon').exists()).toBe(true)
    })

    it('should render custom icon slot', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          showIcon: true,
        },
        slots: {
          icon: '<span class="custom-icon">!</span>',
        },
      })
      expect(wrapper.find('.custom-icon').exists()).toBe(true)
    })
  })

  describe('Bordered', () => {
    it('should not have border by default', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.find('.base-alert').classes()).not.toContain('base-alert--bordered')
    })

    it('should add border when bordered is true', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          bordered: true,
        },
      })
      expect(wrapper.find('.base-alert').classes()).toContain('base-alert--bordered')
    })
  })

  describe('Accessibility', () => {
    it('should have role="alert" by default', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.find('.base-alert').attributes('role')).toBe('alert')
    })

    it('should accept custom role', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          role: 'status',
        },
      })
      expect(wrapper.find('.base-alert').attributes('role')).toBe('status')
    })

    it('should have aria-live="polite" by default', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.find('.base-alert').attributes('aria-live')).toBe('polite')
    })

    it('should have aria-live="assertive" for error variant', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          variant: 'error',
        },
      })
      expect(wrapper.find('.base-alert').attributes('aria-live')).toBe('assertive')
    })

    it('should have aria-label on close button', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          dismissible: true,
        },
      })
      expect(wrapper.find('.base-alert__close').attributes('aria-label')).toBeDefined()
    })
  })

  describe('Close Button Label', () => {
    it('should have default close label', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          dismissible: true,
        },
      })
      expect(wrapper.find('.base-alert__close').attributes('aria-label')).toBe('Fechar alerta')
    })

    it('should accept custom close label', () => {
      const wrapper = mount(BaseAlert, {
        props: {
          dismissible: true,
          closeLabel: 'Dismiss',
        },
      })
      expect(wrapper.find('.base-alert__close').attributes('aria-label')).toBe('Dismiss')
    })
  })

  describe('Transition', () => {
    it('should apply fade transition class', () => {
      const wrapper = mount(BaseAlert)
      expect(wrapper.html()).toContain('transition')
    })
  })
})
