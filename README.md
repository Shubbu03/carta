# Carta

A modern, minimalist letter writing application that allows users to create, edit, and manage documents with a clean, distraction-free interface.

## Features

- **Clean Writing Experience**: Minimalist editor with customizable fonts and sizes
- **Auto-Save**: Automatic saving with debounced updates every 5 seconds
- **Document Management**: Create, edit, and delete letters with sidebar history
- **PDF Export**: Download your letters as PDF documents
- **Device-Based Storage**: Letters are stored per device using MongoDB
- **Responsive Design**: Optimized for desktop experience
- **Dark/Light Theme**: Theme switching capability
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + B`: Toggle sidebar history
  - `Ctrl/Cmd + S`: Manual save
- **Word & Character Count**: Real-time writing statistics

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **PDF Generation**: jsPDF
- **Icons**: Tabler Icons
- **Theme**: next-themes
- **HTTP Client**: Axios
- **Runtime**: Bun (lockfile present)

## Setup Guide

### Prerequisites
- Node.js 18+ or Bun
- MongoDB database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd carta
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
```

4. Run the development server:
```bash
npm run dev
# or
bun run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## API Endpoints

- `GET /api/letters` - Get all letters for a device
- `POST /api/letters` - Create a new letter
- `GET /api/letters/[id]` - Get a specific letter
- `PUT /api/letters/[id]` - Update a letter
- `DELETE /api/letters/[id]` - Delete a letter

## Contributing

Contributions are welcome! This project is open for all developers who want to improve the letter writing experience.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

For major changes, please open an issue first to discuss what you would like to change.
