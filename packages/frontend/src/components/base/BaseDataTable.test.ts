/**
 * BaseDataTable Component Tests
 * TDD Phase: RED - Tests written before implementation
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import BaseDataTable from './BaseDataTable.vue'

describe('BaseDataTable', () => {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nome' },
    { key: 'status', label: 'Status' },
  ] as const

  const rows = [
    { id: '1', name: 'Item 1', status: 'ativo' },
    { id: '2', name: 'Item 2', status: 'inativo' },
  ] as const

  it('should render component', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows,
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should render table headers', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows,
      },
    })

    const headers = wrapper.findAll('th')
    expect(headers).toHaveLength(3)
    expect(headers[0]?.text()).toBe('ID')
    expect(headers[1]?.text()).toBe('Nome')
    expect(headers[2]?.text()).toBe('Status')
  })

  it('should render table rows', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows,
      },
    })

    const tableRows = wrapper.findAll('tbody tr')
    expect(tableRows).toHaveLength(2)
  })

  it('should render cell data correctly', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows,
      },
    })

    const firstRow = wrapper.findAll('tbody tr')[0]
    const cells = firstRow?.findAll('td')

    expect(cells?.[0]?.text()).toBe('1')
    expect(cells?.[1]?.text()).toBe('Item 1')
    expect(cells?.[2]?.text()).toBe('ativo')
  })

  it('should render empty state when no rows', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows: [],
      },
    })

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Nenhum registro encontrado')
  })

  it('should render loading state', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows: [],
        loading: true,
      },
    })

    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true)
  })

  it('should emit row-click event', async () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows,
      },
    })

    const firstRow = wrapper.findAll('tbody tr')[0]
    await firstRow?.trigger('click')

    expect(wrapper.emitted('row-click')).toBeTruthy()
    expect(wrapper.emitted('row-click')?.[0]).toEqual([rows[0]])
  })

  it('should render actions slot', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows,
      },
      slots: {
        actions: '<button>Edit</button>',
      },
    })

    expect(wrapper.html()).toContain('<button>Edit</button>')
  })

  it('should support custom cell rendering with slots', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows,
      },
      slots: {
        'cell-status': '<span class="badge">Active</span>',
      },
    })

    expect(wrapper.html()).toContain('<span class="badge">Active</span>')
  })

  it('should apply striped class when striped prop is true', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows,
        striped: true,
      },
    })

    expect(wrapper.find('table').classes()).toContain('striped')
  })

  it('should apply hoverable class when hoverable prop is true', () => {
    const wrapper = mount(BaseDataTable, {
      props: {
        columns,
        rows,
        hoverable: true,
      },
    })

    expect(wrapper.find('table').classes()).toContain('hoverable')
  })
})
