import React from 'react'
import AnimeCard from '../components/cards/AnimeCard'
import testData from './testData.json'
import { render, screen } from '@testing-library/react'



describe('AnimeCard', () => {

    const {name, id, date} = testData.animeCard


    it('renders an image',() => {
      
  
      render( <div><AnimeCard name={name} id={id} image="https://cdn.myanimelist.net/images/anime/1813/115732.jpg?s=ab9aed5c30625a0f0111cafb547c5cfb" date={date} /> </div>)
  
      const image = screen.getByTestId('image')
  
        expect(image)
    })

    it('does not have date',()=>{

        render(<AnimeCard name={name} id={id} image="https://cdn.myanimelist.net/images/anime/1813/115732.jpg?s=ab9aed5c30625a0f0111cafb547c5cfb"/>)

        const date = screen.getByText(/Realease Date: Unknown/)

        expect(date)
    })
  })