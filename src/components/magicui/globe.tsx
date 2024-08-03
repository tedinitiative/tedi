"use client";

import { useCallback, useEffect, useRef } from "react";
import createGlobe, { type COBEOptions } from "cobe";
import { useSpring } from "react-spring";

import { cn } from "@/lib/utils";
import { MapPinIcon } from "lucide-react";

const TAU = Math.PI * 2;

const GLOBE_CONFIG: COBEOptions = {
	width: 800,
	height: 800,
	onRender: () => void 0,
	devicePixelRatio: 2,
	phi: 0,
	theta: 0.5,
	dark: 0,
	diffuse: 0.4,
	mapSamples: 16000,
	mapBrightness: 1.2,
	baseColor: [1, 1, 1],
	markerColor: [251 / 255, 100 / 255, 21 / 255],
	glowColor: [1, 1, 1],
	markers: [
		{ location: [14.5995, 120.9842], size: 0.03 },
		{ location: [19.076, 72.8777], size: 0.1 },
		{ location: [23.8103, 90.4125], size: 0.05 },
		{ location: [30.0444, 31.2357], size: 0.07 },
		{ location: [39.9042, 116.4074], size: 0.08 },
		{ location: [-23.5505, -46.6333], size: 0.1 },
		{ location: [19.4326, -99.1332], size: 0.1 },
		{ location: [40.7128, -74.006], size: 0.1 },
		{ location: [34.6937, 135.5022], size: 0.05 },
		{ location: [41.0082, 28.9784], size: 0.06 },
	],
};

const locationToAngles = (lat: number, long: number) => {
	return [Math.PI - ((long * Math.PI) / 180 - Math.PI / 2), (lat * Math.PI) / 180] as [number, number];
};

export default function Globe({
	className,
	config: configOverride,
	speed = 0.005,
	phi: defaultPhi = 0,
	markers = [],
}: {
	className?: string;
	config?: Partial<COBEOptions>;
	speed?: number;
	phi?: number;
	markers?: { name: string; location: [number, number] }[];
}) {
	let phi = 0;
	// let theta = 0;
	let currentPhi = 0;
	let currentTheta = 0;
	let width = 0;
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const focusRef = useRef([null, null] as [number | null, number | null]);
	const pointerInteracting = useRef(null as number | null);
	const pointerInteractionMovement = useRef(0);
	const [{ r }, api] = useSpring(() => ({
		r: defaultPhi,
		config: {
			mass: 1,
			tension: 280,
			friction: 40,
			precision: 0.001,
		},
	}));

	const updatePointerInteraction = (value: number | null) => {
		pointerInteracting.current = value;
		canvasRef.current!.style.cursor = value ? "grabbing" : "grab";
		if (value !== null) focusRef.current = [null, null];
	};

	const updateMovement = (clientX: number) => {
		if (pointerInteracting.current !== null) {
			const delta = clientX - pointerInteracting.current;
			pointerInteractionMovement.current = delta;
			api.start({ r: delta / 200 });
		}
	};

	const onRender = useCallback(
		(state: Record<string, number>) => {
			if (!pointerInteracting.current) phi += speed;
			if (focusRef.current.includes(null)) {
				state.phi = phi + r.get();
			} else {
				state.phi = currentPhi;
				state.theta = currentTheta;
				const [focusPhi, focusTheta] = focusRef.current;
				const distPositive = (focusPhi! - currentPhi + TAU) % TAU;
				const distNegative = (currentPhi - focusPhi! + TAU) % TAU;
				// Control the speed
				if (distPositive < distNegative) {
					currentPhi += distPositive * 0.08;
				} else {
					currentPhi -= distNegative * 0.08;
				}
				currentTheta = currentTheta * 0.92 + focusTheta! * 0.08;
			}
			state.width = width * 2;
			state.height = width * 2;
		},
		[pointerInteracting, phi, r, focusRef, width],
	);

	const onResize = () => {
		if (canvasRef.current) {
			width = canvasRef.current.offsetWidth;
		}
	};

	useEffect(() => {
		window.addEventListener("resize", onResize);
		onResize();

		const globe = createGlobe(canvasRef.current!, {
			...GLOBE_CONFIG,
			...configOverride,
			width: width * 2,
			height: width * 2,
			onRender,
		});

		setTimeout(() => (canvasRef.current!.style.opacity = "1"));
		return () => globe.destroy();
	}, []);

	return (
		<div className={cn("absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]", className)}>
			<canvas
				className={cn("h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]")}
				ref={canvasRef}
				onPointerDown={(e) => updatePointerInteraction(e.clientX - pointerInteractionMovement.current)}
				onPointerUp={() => updatePointerInteraction(null)}
				onPointerOut={() => updatePointerInteraction(null)}
				onMouseMove={(e) => updateMovement(e.clientX)}
				onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
			/>
			{markers && (
				<div className="mx-auto flex max-w-3xl items-center justify-center gap-2">
					<div>Go to:</div>
					{markers.map((marker) => (
						<button
							key={marker.name}
							className="flex items-center gap-1 rounded-md bg-green-600 px-1 py-0.5"
							onClick={() => {
								console.log("focusRef", focusRef);
								focusRef.current = locationToAngles(marker.location[0], marker.location[1]);
							}}
						>
							<MapPinIcon />
							<div>{marker.name}</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
