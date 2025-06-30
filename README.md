# Resume Tailor

A web application that helps job seekers tailor their resumes to specific job descriptions using AI.

## Features

- **Resume Tailoring**: Upload or paste your resume and job description to get a tailored version that highlights relevant skills and experience
- **Multiple Resume Templates**: Choose from different resume formats including chronological, functional, and combination
- **Job Application Tracking**: Manage your job applications with a Kanban board interface
- **PDF Support**: Download your tailored resume as a PDF

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI component library

### Backend
- Node.js with Express
- Python for PDF parsing and text processing
- PostgreSQL database with Drizzle ORM
- In-memory storage fallback for reliability

## Getting Started

### Prerequisites
- Node.js
- Python 3.x
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/daryllundy/resume-tailor.git
cd resume-tailor
```

2. Install dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
pip install -r requirements.txt
```

3. Set up the database
```bash
# Create database and run migrations
cd server
npm run db:setup
```

4. Start the development servers
```bash
# Start backend server
cd server
npm run dev

# In a new terminal, start frontend
cd client
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Input Resume**: Paste your resume text or upload a PDF
2. **Add Job Description**: Enter the job description you're applying for
3. **View Tailored Resume**: Review the AI-tailored resume and download as PDF
4. **Track Applications**: Use the job board to track your application status

## Project Structure

```
resume-tailor/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── pages/        # Page components
├── server/               # Backend Node.js application
│   ├── python/           # Python scripts for text processing
│   └── storage.ts        # Data storage implementation
└── shared/               # Shared code between frontend and backend
    └── schema.ts         # Database schema and types
```

## Data Model

The application uses the following data models:

- **Users**: Authentication and user management
- **Job Posts**: Track job applications with status (saved, applied, interview, etc.)
- **Tailoring History**: Store resume tailoring history for each job application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
