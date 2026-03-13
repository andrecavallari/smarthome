import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="max-w-4xl px-4 mx-auto">
        <h1 className="text-2xl">Smart Home Management</h1>
        <p>This is the main dashboard for managing your smart home devices.</p>
      </div>
      <ul className="max-w-4xl mx-auto flex justify-center gap-6 py-4 border-b border-gray-300">
        <li>
          <Link href="/iot/devices" className="text-blue-500 hover:underline">
            Devices
          </Link>
        </li>
        <li>
          <Link href="/iot/controllers" className="text-blue-500 hover:underline">
            Controllers
          </Link>
        </li>
        <li>
          <Link href="/iot/scenes" className="text-blue-500 hover:underline">
            Scenes
          </Link>
        </li>
      </ul>
      {children}
    </div>
  );
}
