import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseButton from '../base/BaseButton.vue'
import BaseInput from '../base/BaseInput.vue'
import LoginForm from './LoginForm.vue'

describe('LoginForm', () => {
  it('should render form', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('should render username input', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.findComponent(BaseInput).exists()).toBe(true)
  })

  it('should render password input', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.findAllComponents(BaseInput)).toHaveLength(2)
  })

  it('should render submit button', () => {
    const wrapper = mount(LoginForm)
    expect(wrapper.findComponent(BaseButton).exists()).toBe(true)
  })

  it('should emit submit event with credentials', async () => {
    const wrapper = mount(LoginForm)
    const inputs = wrapper.findAllComponents(BaseInput)

    await inputs[0]?.setValue('testuser')
    await inputs[1]?.setValue('testpass')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')?.[0]).toEqual([{ username: 'testuser', password: 'testpass' }])
  })

  it('should show loading state', () => {
    const wrapper = mount(LoginForm, {
      props: {
        loading: true,
      },
    })
    expect(wrapper.findComponent(BaseButton).props('loading')).toBe(true)
  })

  it('should display error message', () => {
    const wrapper = mount(LoginForm, {
      props: {
        error: 'Invalid credentials',
      },
    })
    expect(wrapper.text()).toContain('Invalid credentials')
  })
})
