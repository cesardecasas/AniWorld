import React from "react";
import MangaSearchCard from "../components/cards/MangaSearchCard";
import testData from './testData.json'
import { render, screen } from '@testing-library/react'


describe('SearchCard',()=>{


    it('renders the component correctly',()=>{

        render(<MangaSearchCard man={testData.mangaSearchCard}/>)

        

        const title = screen.getByTestId('title')

        expect(title).toBeInTheDocument
    })
})