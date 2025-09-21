import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Taskbar = ({ className }) => {
  const [tasks, setTasks] = useState();
  return (
    <aside className={`${className}`}>
      <div>
        <div className="text-3xl font-bold p-4">Today's Tasks</div>
        <hr />
      </div>
      <div className="p-4 flex gap-2">
        <Input type="text" placeholder="Enter task" />
        <Button variant="secondary">Add Task</Button>
      </div>
      <div className="TASKS_CONTAINER mx-4 mb-4 border-1 border-white rounded-lg flex-1">
        <div className="text-center p-4 text-lg">No tasks yet</div>
      </div>
    </aside>
  );
};

export default Taskbar;
