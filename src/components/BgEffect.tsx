"use client";

import { type ISourceOptions } from "@tsparticles/engine";
import { initParticlesEngine, Particles } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import React, { useEffect, useMemo, useState } from "react";

export default function ParticleAnimation(): React.JSX.Element {
	const [init, setInit] = useState(false);

	useEffect(() => {
		void initParticlesEngine(async (engine) => {
			await loadSlim(engine);
		}).then(() => {
			setInit(true);
		});
	}, []);

	const options: ISourceOptions = useMemo(
		() => ({
			interactivity: {
				events: {
					onClick: {
						enable: true,
						mode: "repulse",
					},
					onHover: {
						enable: true,
						mode: "bubble",
					},
				},
				modes: {
					bubble: {
						distance: 200,
						duration: 2,
						opacity: 0,
						size: 0,
						speed: 3,
					},
					repulse: {
						distance: 200,
						duration: 0.4,
					},
				},
			},
			particles: {
				color: { value: "#ffffff" },
				move: {
					direction: "outside",
					enable: true,
					outModes: "out",
					random: true,
					speed: 0.3,
				},
				number: {
					density: {
						enable: true,
					},
					value: 600,
				},
				opacity: {
					animation: {
						enable: true,
						speed: 5,
					},
					value: { min: 0.3, max: 0.6 },
				},
				shape: {
					type: "circle",
				},
				size: {
					value: 1,
				},
			},
		}),
		[]
	);
	return init ? <Particles id="tsparticles" options={options} /> : <></>;
}
