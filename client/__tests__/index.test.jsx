import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../pages/index'
import indexData from './indexData.json'


describe('Home', () => {

    


  it('renders correctly', async() => {
    

    render(<Home animees={indexData.animees} manga={indexData.manga} quote={indexData.quote} season={indexData.season} />)

    const heading = screen.getByText(/Top upcoming/)
    const imgCarousel =  screen.getAllByAltText(/First slide/)
    const quote = screen.getByTestId('quote')
  
    expect(imgCarousel)
    expect(heading)
    expect(quote)
  })

  
})