import Catalogue from "@/components/catalogueEditor"
import LogoutButton from "@/components/logoutButton"

export default function Home() {

<meta name="viewport" content="width=device-width, initial-scale=1.0"/>

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="flex items-center justify-between border-b bg-[#B80050]">
        <img alt="Sheffield Hallam: Knowledge Applied" className="w-30 md:w-35 lg:w-40" src="/SHU_logo_bnw.png"/>  
      <LogoutButton/>
      </nav>

       <Catalogue/>
    
    </div>
  )
}