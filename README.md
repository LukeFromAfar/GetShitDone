<pre>
_________    _____     _____________ __________     ________                   
__  ____/______  /_    __  ___/__  /____(_)_  /_    ___  __ \_________________ 
_  / __ _  _ \  __/    _____ \__  __ \_  /_  __/    __  / / /  __ \_  __ \  _ \
/ /_/ / /  __/ /_      ____/ /_  / / /  / / /_      _  /_/ // /_/ /  / / /  __/
\____/  \___/\__/      /____/ /_/ /_//_/  \__/      /_____/ \____//_/ /_/\___/ 
                                                                               
</pre>

# GetShitDone - Task Management Application

## Overview
GetShitDone is a modern task management application designed to help users organize their daily tasks efficiently. With a clean, intuitive interface and powerful features, it allows users to create, manage, and track their tasks across different categories.

## Features

### Task Management
* Create, edit, and delete tasks
* Mark tasks as complete
* Set task priority (Important)
* Add detailed notes to tasks
* Set due dates for better planning

### Task Organization
* View all tasks in one place
* Filter tasks by "My Day" for daily focus
* Highlight important tasks in a dedicated view
* Plan ahead with the "Planned" view for tasks with due dates
* Track completed tasks separately

### User Management
* Create a personal account
* Access your tasks from any device
* Secure authentication
* User profile management
* Account deletion with data cleanup

### User Interface
* Clean, modern dark theme
* Responsive design for all devices
* Sidebar navigation for quick access to different views
* Task detail panel for in-depth task management
* Loading indicators for better user experience

## Technologies Used

### Frontend
* React.js
* React Router for navigation
* Context API for state management
* Axios for API requests
* Tailwind CSS for styling
* Lucide React for icons
* React DatePicker for date selection

### Backend
* Node.js with Express
* MongoDB with Mongoose for data storage
* JWT for authentication
* bcrypt for password hashing
* Cookie-based authentication

## Getting Started

### Prerequisites
* Node.js (v14 or higher)
* MongoDB (local or Atlas)
* npm or yarn package manager

### Installation
1. Clone the repository
```
git clone https://github.com/yourusername/GetShitDone.git
cd GetShitDone
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
FROTNTEND_URL = http://localhost:3000
MONGODB_URI = mongodb://localhost:27017/get-shit-done
SERVER_PORT = 4000
SECRET_KEY = your_secure_key
SALT_ROUNDS = 10
```

4. Install frontend dependencies
```
cd ../frontend
npm install
```

5. Create a `.env` file in the frontend directory with:
```
VITE_BACKEND_URL = http://localhost:4000
```

### Running the Application
1. Start the backend server
```
cd backend
npm start
```

2. In a new terminal, start the frontend development server
```
cd frontend
npm start
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage
1. Register a new account or log in
2. Create tasks using the input field at the top of each view
3. Click on a task to view and edit its details
4. Use the sidebar to navigate between different task views
5. Mark tasks as complete by clicking the checkbox
6. Star tasks to mark them as important
7. Add due dates to plan your tasks

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Contact
Lukasz Brzozowski - lukasz.gamvik@gmail.com

Project Link: https://github.com/LukeFromAfar/GetShitDone

## Acknowledgments
* React
* Tailwind CSS
* Express
* MongoDB
* Lucide Icons

Made with ❤️ by Claude 3.7 Anthropic and Lukasz Brzozowski
