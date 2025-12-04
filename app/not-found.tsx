import Sidebar from "./components/Sidebar";

export default function Custom404() {
  // return <h1>404 - Halaman tidak ditemukan.</h1>
  return (
    <main className="pos-app">
        <Sidebar />

      {/* <main className="flex-grow-1 h-100 d-flex flex-column overflow-hidden"> */}
        {/* <div className="h-100 w-100 overflow-auto"> */}
        {/* {children} */}
        <div className="content">
            <h1>404 - Halaman tidak ditemukan.</h1>
        </div>
        {/* </div> */}
      {/* </main> */}
    </main>
  )
}