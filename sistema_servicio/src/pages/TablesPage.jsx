import Cards from "../components/cards"
import HeaderNav from "../components/header_nav"

function TablesPage() {
  return (
    <div className="flex flex-col justify-center items-center">
      <HeaderNav/>
      <div className="flex flex-wrap items-center justify-center gap-4 p-4 md:gap-6 lg:gap-8 md:p-6 lg:p-8 max-w-5xl">
        <Cards/>
        <Cards/>
        <Cards/>
        <Cards/>
        <Cards/>
        <Cards/>
        <Cards/>
        <Cards/>
        <Cards/>
      </div>
    </div>
  )
}

export default TablesPage