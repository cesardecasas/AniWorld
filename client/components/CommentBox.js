import Form from 'react-bootstrap/Form'
import Button from "react-bootstrap/Button"
import { useState } from 'react'

const CommentBox=()=>{
    const [comment, setComment]=useState('')

    return( 
        <Form style={{width:'90%', marginLeft:'5%', padding:'2%'}}>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                <Form.Label>Reviews</Form.Label>
                <Form.Control onChange={(e)=>setComment(e.target.value)} as="textarea" rows={3} />
            </Form.Group>
            <Button type="submit" variant="dark">Submit</Button>
        </Form>
)
}

export default CommentBox 