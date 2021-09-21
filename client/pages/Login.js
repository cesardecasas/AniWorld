import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { useState } from 'react'

const Login = ()=>{

    const [email, setEmail]=useState('')
    const [password, setPassword] =useState('')
    const [validated, setValidated] = useState(false);

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        if (form.checkValidity() === false) {
          event.preventDefault();
          event.stopPropagation();
        }
    
        setValidated(true);
      };

    return(
        <div>
            <section style={{width:'50%', marginLeft:'25%', border:'2px solid black', borderRadius:'1.5rem', marginTop:'13%', marginBottom:'11.5%',padding:'3%'}}>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control required onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Enter email" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control required onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Password" />
                </Form.Group>
                <Button variant="dark" type="submit">
                    Submit
                </Button>
            </Form>
            </section>
        </div>
    )
}


export default Login