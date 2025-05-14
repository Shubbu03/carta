import { ILetter } from "@/lib/models/Letter";
import clsx from "clsx";
import Link from "next/link";

interface SidebarProps {
  show: boolean;
  letters: ILetter[];
}

export default function Sidebar({ show, letters }: SidebarProps) {
  return (
    <div
      className={clsx(
        "absolute top-0 right-0 h-full w-60 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-lg z-20 p-4 overflow-y-auto transition-transform duration-300 ease-in-out",
        show ? "translate-x-0" : "translate-x-full"
      )}
      aria-hidden={!show}
    >
      <h3 className="font-bold text-lg mb-4 dark:text-white">Past letters</h3>
      <ul className="space-y-2">
        {letters.map((letter, index) => (
          <li
            key={index}
            className={clsx(
              "opacity-0 translate-x-4",
              "transition-opacity duration-300 ease-in-out",
              {
                "opacity-100 translate-x-0": show,
              }
            )}
            style={{ transitionDelay: `${index * 75}ms` }}
          >
            <Link
              href={`/letter/${letter._id}`}
              className="block p-2 rounded-lg cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {letter.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
