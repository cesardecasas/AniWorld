import React from "react";
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { useRouter } from "next/router";

const PreviewCard =(props)=>{
    const {image, name, id, darkMode, description, status, format} = props

    const [bg, setBg] = useState('white')
    const [color, setColor] = useState('black')
    const router = useRouter()

    useEffect(()=>{
        if(darkMode){
            setBg('black')
            setColor('white')
          }else if(!darkMode){
            setColor('black')
            setBg('white')
          }
    },[darkMode])

    const getReleaseStatus = (status) =>{
        switch (status) {
            case "FINISHED":
                return "Finished Airing"
            case "NOT_YET_RELEASED":
                return "Upcoming"
            case "RELEASING":
                return "Currently being aired"
            case "CANCELLED":
                return "Project was cancelled"
            case 'HIATUS':
                return "Projects is currently paused from releasing and will resume at a later date"
            default:
                return "Unknown release status";
        }
    }

    const redirect = (id) =>{
        router.push(`/anime/${id}`)
    }

    const cleanString = (str) => str.replace( /(<([^>]+)>)/ig, '');

    return(
        <Card style={{ width: '18rem', margin: '1rem' }}>
            <Image data-testid="image" layout="responsive" borderRadius='1.5rem 1.5rem 1.5rem 1.5rem' src={image} width='100px' quality={100} height='100%' className="card-img-top" alt="Anime poster"/>
            <Card.Body>
              <Card.Title>{name}</Card.Title>
                <Card.Text>Status: {getReleaseStatus(status)} </Card.Text>
                <Card.Text style={{height:"100px", overflow:"hidden"}}>{description ? cleanString(description) : format}</Card.Text>
                <Button variant="dark" onClick={()=>redirect(id)}>Details</Button>
            </Card.Body>
          </Card>
    )
}

export default PreviewCard