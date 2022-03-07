import { Container, Tab, Nav, Col,Row, Button, Modal, Figure } from "react-bootstrap"
import axios from 'axios'
import { useState } from "react";
import {useRouter} from 'next/router'


const Settings =({inf})=>{
    const [show, setShow] = useState(false);
    const def = 'https://t3.ftcdn.net/jpg/00/64/67/80/240_F_64678017_zUpiZFjj04cnLri7oADnyMH0XBYyQghG.jpg'
    const AniAPi = axios.create({baseURL:'https://aniworld-api.herokuapp.com'})
    const router = useRouter()


    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const deleteAccount =async()=>{
        try {
            const user = await AniAPi.delete(`/api/user/delete/${inf.id}`)
            router.push('/')
        } catch (error) {
            console.log(error)
        }

    }

    return(
        <div>
            <Container>
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                <Row>
                    <Col sm={3}>
                    <Nav variant="pills"  className="flex-column">
                        <Nav.Item >
                        <   Nav.Link  eventKey="first">Account</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="second">on Progress</Nav.Link>
                        </Nav.Item>
                    </Nav>
                    </Col>
                    <Col sm={9}>
                    <Tab.Content>
                        <Tab.Pane eventKey="first">
                            <section>
                                <h4>Account Information</h4>
                                <section>
                                    <Figure.Image
                                        style={{border:'solid 1px black'}}
                                        width={171}
                                        height={180}
                                        alt="171x180"
                                        src={inf.profilePic ? inf.profilePic : def}
                                    />
                                    <p>Email: <strong>{inf.email}</strong></p>
                                    <p>UserName: <strong>{inf.userName}</strong></p>
                                </section>
                                <h4>Delete Account</h4>
                                <Button variant='danger'  onClick={handleShow} >Delete Account</Button>
                                <Modal show={show} onHide={handleClose}>
                                    <Modal.Header closeButton>
                                    <Modal.Title>Delete Account</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>This action is irreversible, Do you want to continue?</Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="danger" onClick={deleteAccount}>
                                            Delete
                                        </Button>
                                        <Button variant="dark" onClick={handleClose}>
                                            Cancel
                                        </Button>
                                    </Modal.Footer>
                                </Modal>
                            </section>
                        </Tab.Pane>
                        <Tab.Pane eventKey="second">
                        
                        </Tab.Pane>
                    </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
            </Container>
        </div>
    )
}

export default Settings

export const getServerSideProps =async(context)=>{
    const AniAPi = axios.create({baseURL:'https://aniworld-api.herokuapp.com'})
    const id = context.query.id

    const user = await AniAPi.get(`/api/user/getuser/${id}`)


   


    return{
        props:{
            inf:user.data
        }
    }
}

