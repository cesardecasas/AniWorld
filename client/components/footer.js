import { SiGithub, SiLinkedin } from "react-icons/si";
import {CgWebsite} from 'react-icons/cg'
import {TiDocument} from 'react-icons/ti'

const Footer =()=>{

    return (
        <footer>
                <div>
                    <h6>Social Media</h6>
                    <a className='icon' href='https://www.linkedin.com/in/cesardecasas/'><SiLinkedin/></a>
                    <a className='icon' href='https://github.com/cesardecasas'><SiGithub/></a>
                    <a className='icon' href='https://cesardecasas.com/'><CgWebsite/></a>
                    <a className='icon' href='https://drive.google.com/file/d/136sfn_Cyy1ApZP9rf7h8d4hj5_o0XIQt/view'><TiDocument/></a>
                </div>
                Created by Cesar De Casas
        </footer>
    )
}

export default Footer