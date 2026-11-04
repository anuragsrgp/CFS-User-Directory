# User Directory Application

A full-stack User Directory Management Application developed using React, ASP.NET Core Web API (.NET 8), and SQLite.

## Features

- Create new users
- View all users
- Update existing users
- Delete users
- Search by name, city, and state
- Sort user records
- Pagination
- Form validation
- Responsive user interface
- RESTful API integration
- SQLite database
- Swagger API documentation

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Build Tool | Vite |
| Backend | ASP.NET Core Web API |
| Framework | .NET 8 |
| Database | SQLite |
| ORM | Entity Framework Core |
| API Documentation | Swagger |
| Languages | JavaScript, C# |

## Project Structure

```text
CFSUserDirectory/
├── backend/
│   └── UserDirectory.API/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Models/
│       ├── Repositories/
│       ├── Services/
│       ├── Migrations/
│       ├── Program.cs
│       └── appsettings.json
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── index.html
├── database/
│   └── userdirectory.db
└── README.md
```

## User Fields and Validation

| Field | Validation |
|---|---|
| Name | Required, 2–100 characters |
| Age | 0–120 |
| City | Required |
| State | Required |
| Pincode | 4–10 digits |

## Prerequisites

- .NET 8 SDK
- Node.js and npm
- Visual Studio Code
- Modern web browser

## Installation and Setup

### 1. Backend Setup

Open PowerShell:

```powershell
cd D:\CFSUserDirectory\backend\UserDirectory.API

dotnet restore
dotnet run
```

Backend URL:

`http://localhost:5218`

Swagger URL:

`http://localhost:5218/swagger`

### 2. Frontend Setup

Open a second terminal:

```powershell
cd D:\CFSUserDirectory\frontend

npm install
npm run dev
```

Frontend URL:

`http://localhost:5173`

Keep both terminals running while using the application.

## API Endpoints

Base URL: `http://localhost:5218/api/Users`

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/Users | Get all users |
| GET | /api/Users/{id} | Get user by ID |
| POST | /api/Users | Create user |
| PUT | /api/Users/{id} | Update user |
| DELETE | /api/Users/{id} | Delete user |

## Database

SQLite database is used with Entity Framework Core.

Database file:

`database/userdirectory.db`

## Backend Architecture

- Controllers: Handle HTTP requests.
- Services: Handle business logic and DTO mapping.
- Repositories: Handle database operations.
- Models: Define database entities.
- DTOs: Define API request and response structures.
- Data: Contains DbContext configuration.

## Testing

The following features have been manually tested:

- Create User
- Read User
- Update User
- Delete User
- Search functionality
- Sorting functionality
- Responsive layout
- Name validation
- Age validation
- Pincode validation

## Author

Developed as part of the Full Stack .NET Developer Coding Evaluation.

## License

Created for coding evaluation and educational purposes.