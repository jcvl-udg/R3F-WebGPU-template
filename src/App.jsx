import './App.css'
import { WebGPUCanvas } from './WebGPUCanvas';
import { Experience } from './Experience';

function App() {

  return (
    <>
      <WebGPUCanvas quality={"default"}>
        <Experience />
      </WebGPUCanvas>

    </>
  )
}

export default App
