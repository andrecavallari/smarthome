'use client';

import useTuya from '@/hooks/useTuya';

export default function Page() {
  const { scenes } = useTuya();

  return (
    <div className="max-w-4xl mx-auto p-4 mt-4">
      <h3 className="mt-12 text-2xl border-b border-b-gray-300 pb-4">Scenes</h3>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 mx-auto mt-8 mb-12">
        {scenes.map((scene) => (
          <li key={scene.scene_id} className="border border-gray-300 bg-white rounded-lg p-4 text-gray-700 shadow-xl">
            <div className="min-h-16">
              <h3 className="text-sm font-bold">{scene.name}</h3>
              <p className='text-sm'>Scene ID: {scene.scene_id}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
