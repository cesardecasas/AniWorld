import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../pages/index'
import indexData from './indexData.json'


describe('Home', () => {

    


  it('renders correctly', async() => {
    const animes = [
      { aired: { prop: { from: { month: 1, day: 1, year: 2020 } } }, images: { jpg: { image_url: 'https://example.com/1.jpg' } }, mal_id: 1, title: 'A1' },
      { aired: { prop: { from: { month: 2, day: 2, year: 2021 } } }, images: { jpg: { image_url: 'https://example.com/2.jpg' } }, mal_id: 2, title: 'A2' },
      { aired: { prop: { from: { month: 3, day: 3, year: 2022 } } }, images: { jpg: { image_url: 'https://example.com/3.jpg' } }, mal_id: 3, title: 'A3' }
    ]
    const season = animes
    const manga = []
    const quote = { anime: { name: 'Qanime' }, content: 'Qcontent', character: { name: 'Qchar' } }

    render(<Home animes={animes} manga={manga} quote={quote} season={season} />)

    const heading = screen.getByText(/Top Recommended|Top upcoming|Top Recommended/)
    const quoteNode = screen.getByTestId('quote')

    expect(heading).toBeTruthy()
    expect(quoteNode).toBeTruthy()
  })

  
})