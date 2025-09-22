import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Card from "./Card";
import { v4 as uuidv4 } from "uuid";

const Taskbar = ({ className }) => {
	const [tasksList, setTasksList] = useState(() => {
		const savedTasks = JSON.parse(localStorage.getItem("tasksList"));
		return savedTasks || []; // Return saved tasks if they exist, otherwise return an empty array
	});
	const inputRef = useRef(null);

	useEffect(() => {
		localStorage.setItem("tasksList", JSON.stringify(tasksList));
		console.log(tasksList.length);
	}, [tasksList]);

	const addTask = () => {
		const inputRefContent = inputRef.current.value;
		setTasksList((prev) => [
			...prev,
			{ id: uuidv4(), content: inputRefContent },
		]);

		inputRef.current.value = "";
	};

	const handleKeyDown = (e) => {
		if (e.key == "Enter") {
			addTask();
		}
	};

	return (
		<aside className={`${className}`}>
			<div>
				<div className="text-3xl font-bold p-4">Today's Tasks</div>
				<hr className="border-lineColor" />
			</div>
			<div className="p-4 flex gap-2">
				<Input
					type="text"
					placeholder="Enter task"
					ref={inputRef}
					onKeyDown={handleKeyDown}
				/>
				<Button variant="secondary" onClick={addTask}>
					Add Task
				</Button>
			</div>
			<div className="TASKS_CONTAINER mx-4 mb-4 border-1 border-lineColor rounded-lg flex-1 p-4">
				{tasksList.length !== 0 ? (
					tasksList.map((task) => (
						<Card
							key={task.id}
							task={task}
							setTasksList={setTasksList}
						/>
					))
				) : (
					<div className="text-center text-lg">No tasks yet</div>
				)}
			</div>
		</aside>
	);
};

export default Taskbar;
