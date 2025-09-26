import { useRef, useState, useEffect } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Check } from "lucide-react";
import useSound from "use-sound";

const Timer = ({ className }) => {
	const [playing, setPlaying] = useState(false);
	const [timerKey, setTimerKey] = useState(0);
	const [phase, setPhase] = useState("focus"); // "focus" | "break" | "nap"
	const [round, setRound] = useState(0);
	const [progressBars, setProgressBars] = useState([100, 100, 100]);
	const [remainingTime, setRemainingTime] = useState(0);

	// Durations in seconds
	const focusDuration = 20 * 60;
	const breakDuration = 30;
	const napDuration = 15 * 60;

	const roundToBarIndex = [2, 1, 0];

	const getDuration = () =>
		phase === "focus"
			? focusDuration
			: phase === "break"
			? breakDuration
			: napDuration;

	// Sound hook
	const [playDingSound] = useSound("/sounds/ding.mp3", { volume: 1 });

	// Ref to store absolute end time in ms
	const endTimeRef = useRef(null);
	// Interval ref for clearing
	const intervalRef = useRef(null);

	// Use effect to handle timer ticking with system time
	useEffect(() => {
		if (!playing) {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		// Set absolute end time based on current time + duration when timer starts
		if (!endTimeRef.current) {
			endTimeRef.current = Date.now() + getDuration() * 1000;
		}

		// Update remaining time at 200ms intervals for smoother updates
		intervalRef.current = setInterval(() => {
			const now = Date.now();
			let remaining = Math.round((endTimeRef.current - now) / 1000);
			remaining = remaining >= 0 ? remaining : 0;
			setRemainingTime(remaining);

			// Update progress bars on "focus" phase
			if (phase === "focus") {
				const idx = roundToBarIndex[round];
				const percent = (remaining / focusDuration) * 100;
				setProgressBars((prev) => {
					const newBars = [...prev];
					newBars[idx] = percent;
					return newBars;
				});
			}

			// When timer completes
			if (remaining <= 0) {
				// Play sound
				playDingSound();

				// Stop timer and advance phases
				setPlaying(false);
				endTimeRef.current = null;

				if (phase === "focus") {
					if (round < 2) {
						setPhase("break");
					} else {
						setPhase("nap");
					}
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

		// Clear interval on cleanup or when dependencies change
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [playing, phase, round]);

	// Listen for tab visibility change to update timer immediately on focus
	useEffect(() => {
		const onVisibilityChange = () => {
			if (
				document.visibilityState === "visible" &&
				playing &&
				endTimeRef.current
			) {
				const now = Date.now();
				let remaining = Math.round((endTimeRef.current - now) / 1000);
				remaining = remaining >= 0 ? remaining : 0;
				setRemainingTime(remaining);
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
		setRemainingTime(0);
		endTimeRef.current = null;
	};

	// Show formatted remaining time or full duration when stopped
	const displayTime = playing ? remainingTime : getDuration();
	const minutes = Math.floor(displayTime / 60);
	const seconds = displayTime % 60;

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

					{/* Use CountdownCircleTimer for visualization, disable internal timer */}
					<div
						style={{
							position: "relative",
							display: "inline-block",
						}}
					>
						<CountdownCircleTimer
							key={timerKey + phase}
							isPlaying={false}
							duration={getDuration()}
							initialRemainingTime={displayTime}
							colors="#3d3d3d"
							size={300}
							strokeLinecap="butt"
							trailColor="transparent"
						/>
						<div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none text-5xl font-bold">
							{minutes.toString().padStart(2, "0")}:
							{seconds.toString().padStart(2, "0")}
						</div>
					</div>

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
								onClick={() => {
									setPlaying(false);
									endTimeRef.current = null; // Reset end time on pause
								}}
							>
								<Pause />
							</Button>
						) : (
							<Button
								className="flex-1 cursor-pointer"
								onClick={() => {
									setPlaying(true);
									if (!endTimeRef.current) {
										endTimeRef.current =
											Date.now() + getDuration() * 1000;
										setRemainingTime(getDuration());
									}
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
