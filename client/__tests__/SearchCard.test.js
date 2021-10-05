import React from "react";
import SearchCard from "../components/cards/SearchCard";
import testData from './testData.json'
import { render, screen } from '@testing-library/react'


describe('SearchCard',()=>{

    const {id, name, image, score, synopsis, episodes, rated} = testData.searchCard

    it('renders the component correctly',()=>{

        render(<SearchCard id={id} name={name} image={image} score={score} synopsis={synopsis} episodes={episodes} rated={rated} />)

        const title = screen.getByText(/Fate/)
        const ep = screen.getByText(/13/)
        const rating = screen.getByText(/Rated: R/)
        const img = screen.getByAltText(/Anime poster/)

        expect(title).toBeInTheDocument
        expect(ep).toBeInTheDocument
        expect(rating).toBeInTheDocument
        expect(img).toBeInTheDocument
    })
})