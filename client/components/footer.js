import { SiGithub, SiLinkedin } from "react-icons/si";
import {MdMail} from 'react-icons/md'

const Footer =()=>{

    return (
        <footer>
             
            <div className='social'>
                <a href='https://github.com/cesardecasas'><SiGithub className='icon'/> </a>
                <a href='https://www.linkedin.com/in/cesardecasas/'><SiLinkedin className='icon'/></a> 
                <a href="mailto:cesar.decasasgarcia@gmail.com?"><MdMail className='icon'/>  </a>
            <p className='register' style={{color:'white'}}>© Cesar De Casas. All rights reserved</p>
            </div>
            <br/>
        </footer>
    )
}

export default Footer