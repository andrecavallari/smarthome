import { JSX } from "react";

export default function Title({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="max-w-4xl mx-auto py-4 mt-4">
      <h1 className="text-2xl border-b border-gray-400">{children}</h1>
    </div>
  );
}
