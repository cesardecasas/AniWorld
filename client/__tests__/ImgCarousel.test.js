import React from "react";
import ImgCarousel from "../components/ImgCarousel";
import testData from './testData.json'
import { render, screen } from '@testing-library/react'


describe('ImgCarousel', ()=>{

    it('renders correctly',()=>{

        render(<ImgCarousel carousel={testData.imgCarousel}/>)

        // The carousel items use the titles as image alt text in this component.
        const imgs = screen.getAllByRole('img')
        expect(imgs.length).toBeGreaterThan(0)

    })

})