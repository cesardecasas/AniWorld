import React from "react";
import ImgCarousel from "../components/ImgCarousel";
import testData from './testData.json'
import { render, screen } from '@testing-library/react'


describe('ImgCarousel', ()=>{

    it('renders correctly',()=>{

        render(<ImgCarousel carousel={testData.imgCarousel}/>)

        expect(screen.getAllByAltText(/First slide/))

    })

})