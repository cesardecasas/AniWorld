import React from 'react'
import testData from './testData.json'
import { render, screen } from '@testing-library/react'
import RelatedCard from '../components/cards/RelatedCard'


describe('RelatedCard',()=>{

    it('renders text', ()=>{

        render(<RelatedCard  card={testData.relatedCard}/>)

        const text = screen.getByText(/Fate/)

        expect(text)
    })
})