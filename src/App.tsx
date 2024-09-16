import { useState } from "react"

import "./App.css"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="card">
        <button className="p-40" onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR test pull request
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
