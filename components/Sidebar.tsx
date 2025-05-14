import clsx from "clsx";

interface SidebarProps {
  show: boolean;
}

export default function Sidebar({ show }: SidebarProps) {
  const pastLetters = [
    "Document 1",
    "Meeting Notes",
    "Ideas",
    "Journal Entry",
    "To-Do List",
    "Project Proposal",
    "Draft Email",
    "Research Notes",
    "Quick Memos",
    "Weekly Summary",
    "Client Feedback",
    "Vision Statement",
  ];

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
        {pastLetters.map((letter, index) => (
          <li
            key={index}
            className={clsx(
              "p-2 rounded-lg cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
              "opacity-0 translate-x-4",
              "transition-opacity duration-300 ease-in-out",
              {
                "opacity-100 translate-x-0": show,
              }
            )}
            style={{ transitionDelay: `${index * 75}ms` }}
          >
            {letter}
          </li>
        ))}
      </ul>
    </div>
  );
}
