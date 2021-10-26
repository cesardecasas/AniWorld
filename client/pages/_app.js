import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.css';
import Layout from '../components/Layout';
import { useState} from 'react'

function MyApp({ Component, pageProps }) {

  const [darkMode, setDarkMode]=useState(false)

  return (
  <Layout  darkMode={darkMode} setDarkMode={setDarkMode}  >
    <Component darkMode={darkMode} {...pageProps} />
  </Layout>
  )
}

export default MyApp
