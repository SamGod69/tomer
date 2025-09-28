import { useRef, useState, useEffect } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import useSound from "use-sound";

const Timer = ({ className }) => {
	const focusDuration = 10;
	const breakDuration = 30;
	const napDuration = 15 * 60;

	const getDuration = (phase) =>
		phase === "focus"
			? focusDuration
			: phase === "break"
			? breakDuration
			: napDuration;

	const [phase, setPhase] = useState("focus");
	const [round, setRound] = useState(0);
	const roundToBarIndex = [2, 1, 0];
	const [progressBars, setProgressBars] = useState([100, 100, 100]);

	// Initialize remainingTime with the full duration for the phase
	const [remainingTime, setRemainingTime] = useState(getDuration(phase));
	const [playing, setPlaying] = useState(false);
	const [timerKey, setTimerKey] = useState(0);

	const [playDingSound] = useSound("/sounds/ding.mp3", { volume: 1 });

	const endTimeRef = useRef(null);
	const intervalRef = useRef(null);

	// When phase changes, reset remainingTime to full duration
	useEffect(() => {
		setRemainingTime(getDuration(phase));
	}, [phase]);

	useEffect(() => {
		if (!playing) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		if (!endTimeRef.current) {
			endTimeRef.current = Date.now() + remainingTime * 1000;
		}

		intervalRef.current = setInterval(() => {
			const now = Date.now();
			let rem = Math.round((endTimeRef.current - now) / 1000);
			rem = rem >= 0 ? rem : 0;
			setRemainingTime(rem);

			if (phase === "focus") {
				const idx = roundToBarIndex[round];
				const percent = (rem / focusDuration) * 100;
				setProgressBars((prev) => {
					const newBars = [...prev];
					newBars[idx] = percent;
					return newBars;
				});
			}

			if (rem <= 0) {
				playDingSound();
				setPlaying(false);
				endTimeRef.current = null;
				if (phase === "focus") {
					if (round < 2) setPhase("break");
					else setPhase("nap");
				} else if (phase === "break") {
					setPhase("focus");
					setRound((prev) => Math.min(prev + 1, 2));
				} else if (phase === "nap") {
					resetAll();
					return;
				}
				setTimerKey((prev) => prev + 1);
			}
		}, 200);

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [playing, phase, round]);

	useEffect(() => {
		const onVisibilityChange = () => {
			if (
				document.visibilityState === "visible" &&
				playing &&
				endTimeRef.current
			) {
				const now = Date.now();
				let rem = Math.round((endTimeRef.current - now) / 1000);
				rem = rem >= 0 ? rem : 0;
				setRemainingTime(rem);
			}
		};
		document.addEventListener("visibilitychange", onVisibilityChange);
		return () => {
			document.removeEventListener(
				"visibilitychange",
				onVisibilityChange
			);
		};
	}, [playing]);

	const resetAll = () => {
		setPlaying(false);
		setPhase("focus");
		setRound(0);
		setProgressBars([100, 100, 100]);
		setTimerKey((prev) => prev + 1);
		setRemainingTime(getDuration("focus"));
		endTimeRef.current = null;
	};

	const minutes = Math.floor(remainingTime / 60);
	const seconds = remainingTime % 60;

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

					<div className="relative inline-block">
						<CountdownCircleTimer
							key={timerKey + phase}
							duration={getDuration(phase)}
							isPlaying={playing}
							colors="#3d3d3d"
							size={300}
							strokeLinecap="butt"
							trailColor="transparent"
						>
							{() => (
								<div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-5xl font-bold">
									{minutes.toString().padStart(2, "0")}:
									{seconds.toString().padStart(2, "0")}
								</div>
							)}
						</CountdownCircleTimer>
					</div>

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
								onClick={() => {
									if (!endTimeRef.current) {
										endTimeRef.current =
											Date.now() +
											getDuration(phase) * 1000;
										setRemainingTime(getDuration(phase));
									} else {
										endTimeRef.current =
											Date.now() + remainingTime * 1000;
									}
									setPlaying(true);
								}}
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
