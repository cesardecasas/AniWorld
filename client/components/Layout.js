import Nav from './nav'
import Footer from './footer'

export default function Layout({ children, darkMode, setDarkMode, authenticated, currentUser }) {


  return (
    <>
      <Nav authenticated={authenticated} darkMode={darkMode} setDarkMode={setDarkMode}/>
      <main>{children}</main>
      <Footer darkMode={darkMode}/>
    </>
  )
}