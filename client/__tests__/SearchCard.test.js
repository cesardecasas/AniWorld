import React from "react";
import SearchCard from "../components/cards/SearchCard";
import testData from './testData.json'
import { render, screen } from '@testing-library/react'


describe('SearchCard',()=>{

    const {id, name, image, score, episodes, format} = testData.searchCard

    it('renders the component correctly',()=>{

        render(<SearchCard id={id} name={name} image={image} score={score} episodes={episodes} format={format} />)

        expect(screen.getByText(/Fate/)).toBeInTheDocument()
        expect(screen.getByText(/TV · 13 eps/)).toBeInTheDocument()
        expect(screen.getByText(/8\.3/)).toBeInTheDocument()
        expect(screen.getByAltText(/Fate\/Zero/)).toBeInTheDocument()
    })
})
