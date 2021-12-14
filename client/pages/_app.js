import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css';
import Layout from '../components/Layout';
import { useEffect, useState} from 'react'
import axios from 'axios'

function MyApp({ Component, pageProps }) {

  const [darkMode, setDarkMode]=useState(false)
  const [authenticated, setAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const client = axios.create({baseURL:'https://aniworld-api.herokuapp.com/'})

  const checkSession = async()=>{ 
    const token = localStorage.getItem('token')
    const config = {headers:  {
      'Authorization': `Bearer ${token}`,
  }
};
        
    if (token) {
      try {
        const session = await client.get('api/user/session', config)
        setAuthenticated(true)
        setCurrentUser({userName:session?.data?.user?.userName, id:session?.data?.user?.id})
        localStorage.setItem('user',JSON.stringify(session?.data?.user?.userName));
        
        
        
      } catch (error) {
        console.log(error)
        setCurrentUser(null)
        setAuthenticated(false)
        localStorage.clear()
        
      }
    }
  }

  useEffect(()=>{
    checkSession()
  },[])

  return (
  <Layout setCurrentUser={setCurrentUser} setAuthenticated={setAuthenticated} currentUser={currentUser} authenticated={authenticated}  darkMode={darkMode} setDarkMode={setDarkMode}  >
    <Component setCurrentUser={setCurrentUser} currentUser={currentUser} setAuthenticated={setAuthenticated} authenticated={authenticated} darkMode={darkMode} {...pageProps} />
  </Layout>
  )
}

export default MyApp
