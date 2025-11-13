import Image from "next/image";

export default function Home() {
  return (
    <main className="container mt-5">
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">Bootstrap is working!</h1>
          <p className="col-md-8 fs-4">
            This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.
          </p>
          <button className="btn btn-primary btn-lg" type="button">
            Example button
          </button>
        </div>
      </div>

      <div className="row align-items-md-stretch">
        <div className="col-md-6">
          <div className="h-100 p-5 text-white bg-dark rounded-3">
            <h2>Change the background</h2>
            <p>Swap the background-color utility and add a `.text-*` color utility to mix up the look.</p>
            <button className="btn btn-outline-light" type="button">Example button</button>
          </div>
        </div>
        <div className="col-md-6">
          <div className="h-100 p-5 bg-light border rounded-3">
            <h2>Add borders</h2>
            <p>Or, keep it light and add a border for some added definition to the boundaries of your content. Be sure to look under the hood at the source code, where we've adjusted color, sizing, and more utilities to help you build.</p>
            <button className="btn btn-outline-secondary" type="button">Example button</button>
          </div>
        </div>
      </div>

      <footer className="pt-3 mt-4 text-muted border-top">
        © 2025
      </footer>
    </main>
  );
}