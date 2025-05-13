export default function Sidebar() {
  const pastLetters = ["Document 1", "Meeting Notes", "Ideas", "Journal Entry", "To-Do List"];

  return (
    <div className="w-60 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto">
      <h3 className="font-bold text-lg mb-4">Past letters</h3>
      <ul className="space-y-2">
        {pastLetters.map((letter, index) => (
          <li key={index} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded">
            {letter}
          </li>
        ))}
      </ul>
    </div>
  );
}
