import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import useSound from "use-sound";

const Card = ({ task, setTasksList }) => {
	const [playPopSound] = useSound("/sounds/pop.mp3", { volume: 1 });

	const removeTask = () => {
		setTimeout(() => {
			setTasksList((prev) => prev.filter((item) => item.id !== task.id));
			playPopSound();
		}, 75);
	};

	return (
		<div>
			<div className="flex items-center gap-2 pb-1">
				<Checkbox onCheckedChange={removeTask} />
				<span className="text-lg">{task.content}</span>
			</div>
			<hr className="mb-2 border-lineColor" />
		</div>
	);
};

export default Card;
