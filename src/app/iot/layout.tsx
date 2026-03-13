import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="max-w-4xl p-6 mx-auto">
        <h1 className="text-2xl">Smart Home Management</h1>
        <p>This is the main dashboard for managing your smart home devices.</p>
      </div>
      <ul className="max-w-4xl mx-auto flex justify-center gap-6 py-4 border-b border-gray-300 [&_a]:border [&_a]:border-gray-500 [&_a]:px-5 [&_a]:py-3 [&_a]:rounded-md">
        <li>
          <Link href="/iot/devices" className="text-gray-500 hover:underline bg-white">
            Devices
          </Link>
        </li>
        <li>
          <Link href="/iot/controllers" className="text-gray-500 hover:underline bg-white">
            Controllers
          </Link>
        </li>
        <li>
          <Link href="/iot/scenes" className="text-gray-500 hover:underline bg-white">
            Scenes
          </Link>
        </li>
      </ul>
      {children}
    </div>
  );
}
