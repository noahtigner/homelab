import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';
import piholeLogo from '/pihole.svg';
import fastAPILogo from '/fastapi.svg';

export default function Attribution() {
	return (
		<div>
			<a href="https://vitejs.dev" target="_blank" rel="noreferrer">
				<img src={viteLogo} className="logo vite" alt="Vite logo" />
			</a>
			<a href="https://react.dev" target="_blank" rel="noreferrer">
				<img src={reactLogo} className="logo react" alt="React logo" />
			</a>
			<a href="https://pi-hole.net/" target="_blank" rel="noreferrer">
				<img
					src={piholeLogo}
					className="logo pihole"
					alt="Pihole logo"
				/>
			</a>
			<a
				href="https://fastapi.tiangolo.com/"
				target="_blank"
				rel="noreferrer"
			>
				<img
					src={fastAPILogo}
					className="logo fastAPI"
					alt="FastAPI logo"
				/>
			</a>
		</div>
	);
}
