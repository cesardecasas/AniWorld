import Nav from './nav'
import Footer from './footer'

export default function Layout({ children, darkMode, setDarkMode }) {


  return (
    <>
      <Nav darkMode={darkMode} setDarkMode={setDarkMode}/>
      <main>{children}</main>
      <Footer darkMode={darkMode}/>
    </>
  )
}