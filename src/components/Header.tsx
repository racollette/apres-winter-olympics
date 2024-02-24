import { useRouter } from "next/router";
import LoginModal from "./LoginModal";
import { Navbar } from "flowbite-react";
import Image from "next/image";

export default function Header() {
  const router = useRouter();

  return (
    <Navbar className="bg-purple-900 text-white" fluid>
      <Navbar.Brand>
        {/* <img
          alt="Flowbite React Logo"
          className="mr-3 h-6 sm:h-9"
          src="/favicon.svg"
        /> */}
        <span
          className="text-md flex cursor-pointer flex-row items-center gap-2 self-center whitespace-nowrap px-2 font-clayno hover:animate-wiggle dark:text-white md:text-xl"
          onClick={() => router.push(`/`)}
        >
          <Image
            src="/favicon.png"
            width="50"
            height="50"
            alt="2024 Winter Olympics"
            className="hidden hover:animate-wiggle md:block"
          />
          <p className="block md:hidden">Winter Olympics</p>
          <p className="hidden md:block">2024 Apres Winter Olympics</p>
        </span>
      </Navbar.Brand>
      <div className="flex gap-2 md:order-2">
        <LoginModal />
        <Navbar.Toggle className="bg-transparent text-white hover:bg-transparent focus:ring-zinc-500" />
      </div>
      <Navbar.Collapse>
        <Navbar.Link
          className="text-md cursor-pointer font-clayno text-white"
          href={`/events`}
        >
          Events
        </Navbar.Link>
        <Navbar.Link
          className="text-md cursor-pointer font-clayno text-white"
          href={`/leaderboard`}
        >
          Leaderboards
        </Navbar.Link>
        <Navbar.Link
          className="text-md cursor-pointer font-clayno text-white"
          href={`/podium`}
        >
          Podium
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
