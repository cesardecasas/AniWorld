const React = require('react')
const { render } = require('@testing-library/react')
const SettingsMod = require('../pages/settings/[id]')
const Settings = SettingsMod.default || SettingsMod

test('Settings page renders', () => {
  const mockInfo = { profilePic: '', email: 'a@a.com', userName: 'tester', id: '1' }
  const { container } = render(React.createElement(Settings, { inf: mockInfo }))
  expect(container).toBeTruthy()
})
