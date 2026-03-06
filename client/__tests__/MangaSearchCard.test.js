const React = require('react')
const { render, screen } = require('@testing-library/react')
const MangaSearchCardMod = require('../components/cards/MangaSearchCard')
const MangaSearchCard = MangaSearchCardMod.default || MangaSearchCardMod

describe('MangaSearchCard', () => {
    it('renders the component correctly', () => {
        const mockMan = {
            id: '1',
            relationships: [],
            attributes: { title: { en: 'Test' }, description: { en: '' }, publicationDemographic: '' }
        }

        render(React.createElement(MangaSearchCard, { man: mockMan }))

        const title = screen.getByTestId('title')

        expect(title).toBeTruthy()
    })
})