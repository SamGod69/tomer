import { useState } from "react";
import Taskbar from "./components/Taskbar";
import Timer from "./components/Timer";

function App() {
  return (
    <main className="grid grid-cols-3 h-screen bg-backgroundColor text-textColor">
      <Taskbar className="col-span-1 border-r-1 border-white flex flex-col" />
      <Timer className="col-span-2" />
    </main>
  );
}

export default App;
