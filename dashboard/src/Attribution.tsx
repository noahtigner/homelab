import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import piholeLogo from '/pihole.svg';

export default function Attribution() {
  return (
    <div>
      <a href="https://vitejs.dev" target="_blank">
        <img src={viteLogo} className="logo vite" alt="Vite logo" />
      </a>
      <a href="https://react.dev" target="_blank">
        <img src={reactLogo} className="logo react" alt="React logo" />
      </a>
      <a href="https://pi-hole.net/" target="_blank">
        <img src={piholeLogo} className="logo pihole" alt="Pihole logo" />
      </a>
    </div>
  );
}
