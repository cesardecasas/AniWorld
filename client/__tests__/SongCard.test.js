import React from "react";
import SongCard from "../components/cards/SongCard";
import testData from './testData.json'
import { render, screen } from '@testing-library/react'


describe('SongCard',()=>{
    const {id, title, album, spotify, url, artist} = testData.songCard

    it('renders component',()=>{

        render(<SongCard id={id} title={title} album={album} spotify={spotify} url={url} artist={artist}/>)

        expect(screen.getByText(/MEMORIA/))
        expect(screen.getByText(/BLAU/))
        expect(screen.getByTestId('videoPlayer'))

    })

    it('no preview available',()=>{

        render(<SongCard id={id} title={title} album={album} spotify={spotify} artist={artist}/>)

        expect(screen.getByText(/MEMORIA/))
        expect(screen.getByText(/BLAU/))
        expect(screen.getByText(/No Preview Available/))

    })
})