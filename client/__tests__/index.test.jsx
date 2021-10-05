import React from 'react'
import { render, screen } from '@testing-library/react'
import Home from '../pages/index'
import indexData from './indexData.json'


describe('Home', () => {

    


  it('renders a heading', async() => {
    

    render(<Home animees={indexData.animees} manga={indexData.manga} quote={indexData.quote} season={indexData.season} />)

    const heading = screen.getByText('Top upcoming')


  })
})