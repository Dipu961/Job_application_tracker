# Job Application Tracker

A simple, secure web application to track your job applications. Each user can register, log in, and manage their own job applications. Built with Node.js, Express, SQLite, and vanilla HTML/CSS/JS.

---

## Features

- User registration and login (with hashed passwords)
- JWT authentication (secure, httpOnly cookies)
- Add, edit, and delete job applications
- Dashboard with application stats
- Each user only sees and manages their own jobs
- Professional, responsive UI

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. **Clone the repository or copy the folder:**

   ```sh
   git clone <repo-url>
   cd Job\ application\ Tracker
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **(Optional) Set environment variables:**

   Create a `.env` file in the root directory to override the default JWT secret:

   ```
   JWT_SECRET=your-very-secret-key
   ```

4. **Start the server:**

   ```sh
   node server.js
   ```

5. **Open your browser and go to:**

   ```
   http://localhost:3000
   ```

---

## Project Structure

```
Job application Tracker/
├── db/
│   └── database.db         # SQLite database (auto-created)
├── public/
│   └── css/
│       └── style.css       # Optional: extra CSS
├── views/
│   ├── index.html          # Main dashboard UI
│   ├── login.html          # Login page
│   └── register.html       # Registration page
├── server.js               # Main backend server
├── package.json
└── README.md
```

---

## Usage

- **Register** a new account.
- **Login** with your credentials.
- **Add, edit, or delete** your job applications.
- **Logout** securely from the dashboard.

---

## Security Notes

- Passwords are hashed using bcrypt.
- JWT tokens are stored in httpOnly cookies.
- All job data is user-specific and protected by authentication middleware.

---

## License

This project is for demonstration and internal use. Please contact the author for commercial or production use.

---

## Author

- [Dipayan Kundu]
- [kundudipayan353@gmail.com]
