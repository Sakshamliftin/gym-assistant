import Link from "next/link";
import OpenUserProfile from "./OpenUserProfile";

export default function Navbar() {
  return (
    <nav className="flex justify-between p-6 bg-slate-900 text-white ">
      <div className="font-bold text-xl">Gym Buddy</div>

      <div className="space-x-4 flex flex-row">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/chat">Chat</Link>
        <OpenUserProfile />
      </div>
    </nav>
  );
}
