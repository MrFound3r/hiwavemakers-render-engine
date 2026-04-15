import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
      <main className="flex flex-col items-center text-center max-w-2xl px-4">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">Welcome to the Render Manager</h1>
        <p className="text-xl text-gray-600 mb-10">
          Manage your classes, students, and process video renderings all in one place.
        </p>

        <Button
          variant={"default"}
          size="default">
          <Link href="/dashboard">Go to Class Dashboard →</Link>
        </Button>
      </main>
    </div>
  );
}
