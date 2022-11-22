import { mount } from '@vue/test-utils'
import PageSection from '@/components/settings/PageSection.vue'

describe('PageSection.vue', () => {
  it('renders props.title when passed', () => {
    const title = 'My title'
    const wrapper = mount(PageSection, {
      propsData: { title }
    })
    expect(wrapper.text()).toMatch(title)
  })
})
