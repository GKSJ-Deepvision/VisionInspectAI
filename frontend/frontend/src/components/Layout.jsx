import Header from './Header.jsx'
import loginBg from '../assets/login-background.png'

export default function Layout({ children }) {
return (
<div
className="min-h-screen bg-cover bg-center bg-fixed"
style={{
backgroundImage: `linear-gradient(rgba(5,10,25,.75), rgba(5,10,25,.82)), url(${loginBg})`,
}}
>


  {/* Top Navigation */}
  <Header />

  {/* Main Content */}
  <main className="pt-20 min-h-screen">
    {children}
  </main>

</div>


)
}
