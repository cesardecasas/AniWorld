import Nav from './nav'
import Footer from './footer'

export default function Layout({ children, darkMode, setDarkMode, authenticated, currentUser, setCurrentUser, setAuthenticated }) {


  return (
    <>
      <Nav currentUser={currentUser} authenticated={authenticated} darkMode={darkMode} setDarkMode={setDarkMode} setCurrentUser={setCurrentUser} setAuthenticated={setAuthenticated}/>
      <main>{children}</main>
      <Footer darkMode={darkMode}/>
    </>
  )
}