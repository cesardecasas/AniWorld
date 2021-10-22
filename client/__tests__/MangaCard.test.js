import React from "react";
import MangaCard from "../components/cards/MangaCard";
import testData from './testData.json'
import { render, screen } from '@testing-library/react'

describe('MangaCard',()=>{

    const {name, id, att} = testData.mangaCard

    it('renders correctly',async()=>{

        render(<MangaCard name={name} id={id} att={att} />)

        const img = await screen.findByTestId('img')

        expect(img)

    })

    it('uses Loader',()=>{
        
        render(<MangaCard name={name} id={id}  />)

        expect(screen.getByRole('status'))
    })
})