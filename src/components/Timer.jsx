import { useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Check } from "lucide-react";

const Timer = ({ className }) => {
	const [playing, setPlaying] = useState(false);
	const [timerKey, setTimerKey] = useState(0);
	const [phase, setPhase] = useState("focus"); // "focus" | "break" | "nap"
	const [round, setRound] = useState(0);
	const [progressBars, setProgressBars] = useState([100, 100, 100]);

	const focusDuration = 1200;
	const breakDuration = 30;
	const napDuration = 15 * 60;

	const roundToBarIndex = [2, 1, 0];

	const duration =
		phase === "focus"
			? focusDuration
			: phase === "break"
			? breakDuration
			: napDuration;

	// Update progress with fractional seconds
	const updateProgress = (remainingTime) => {
		if (phase === "focus") {
			const idx = roundToBarIndex[round];
			const percent = (remainingTime / focusDuration) * 100;
			setProgressBars((prev) => {
				const newBars = [...prev];
				newBars[idx] = percent;
				return newBars;
			});
		}
	};

	const resetAll = () => {
		setPlaying(false);
		setPhase("focus");
		setRound(0);
		setProgressBars([100, 100, 100]);
		setTimerKey((prev) => prev + 1);
	};

	return (
		<div className={`${className}`}>
			<div className="h-screen flex flex-col relative">
				<div>
					<div className="text-3xl font-bold p-4">
						Ultradian Sprint Timer
					</div>
					<hr className="border-lineColor" />
				</div>

				<div className="flex flex-col justify-center items-center flex-1 gap-4">
					<span className="text-3xl font-semibold">
						{phase === "focus"
							? "Focus!!"
							: phase === "break"
							? "Relax your eyes 👀"
							: "Take a nap 😴"}
					</span>

					<CountdownCircleTimer
						key={timerKey + phase}
						isPlaying={playing}
						duration={duration}
						colors="#3d3d3d"
						size={300}
						strokeLinecap="butt"
						trailColor="transparent"
						onUpdate={updateProgress} // receives fractional remainingTime
						onComplete={() => {
							if (phase === "focus") {
								if (round < 2) {
									setPhase("break");
									setPlaying(false);
									setTimerKey((prev) => prev + 1);
									return { shouldRepeat: false };
								} else {
									setPhase("nap");
									setPlaying(false);
									setTimerKey((prev) => prev + 1);
									return { shouldRepeat: false };
								}
							} else if (phase === "break") {
								setPhase("focus");
								setRound((prev) => Math.min(prev + 1, 2));
								setPlaying(false);
								setTimerKey((prev) => prev + 1);
								return { shouldRepeat: false };
							} else if (phase === "nap") {
								resetAll();
								return { shouldRepeat: false };
							}
						}}
					>
						{({ remainingTime }) => {
							const minutes = Math.floor(remainingTime / 60);
							const seconds = Math.floor(remainingTime % 60);
							return (
								<div className="text-4xl font-bold">
									{minutes.toString().padStart(2, "0")}:
									{seconds.toString().padStart(2, "0")}
								</div>
							);
						}}
					</CountdownCircleTimer>

					{/* Progress bars hidden during nap */}
					{phase !== "nap" && (
						<div className="flex gap-2 absolute bottom-0 left-0 p-4">
							{progressBars.map((value, i) => (
								<Progress
									key={i}
									value={value}
									className="[&>div]:bg-white w-[75px] bg-[#3d3d3d] rounded-none"
								/>
							))}
						</div>
					)}

					{/* Controls */}
					<div className="flex gap-2 w-[300px]">
						{playing ? (
							<Button
								className="flex-1 cursor-pointer"
								onClick={() => setPlaying(false)}
							>
								<Pause />
							</Button>
						) : (
							<Button
								className="flex-1 cursor-pointer"
								onClick={() => setPlaying(true)}
							>
								<Play />
							</Button>
						)}

						<Button
							className="flex-1 cursor-pointer"
							onClick={resetAll}
						>
							{phase === "nap" ? <Check /> : <RotateCcw />}
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Timer;
