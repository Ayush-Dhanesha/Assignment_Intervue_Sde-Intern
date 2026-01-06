# Live Polling System

A real-time polling application built for classroom interactions, allowing teachers to create polls and students to vote in real-time.

![Live Polling System](https://img.shields.io/badge/Status-Active-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248)
![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-black)

---

## 📋 Assignment Requirements

### Core Features ✅
| Requirement | Status | Description |
|------------|--------|-------------|
| Teacher can ask a question | ✅ Done | Teachers can create polls with 2-6 multiple choice options |
| Students can answer | ✅ Done | Students select an option and submit their vote |
| Live results | ✅ Done | Real-time vote updates via Socket.IO |
| Time limit | ✅ Done | Configurable duration (default: 60 seconds) |
| Results after timer | ✅ Done | Automatic poll closure with final results display |

### Bonus Features ✅
| Feature | Status | Description |
|---------|--------|-------------|
| Configurable time limit | ✅ Done | Teachers can set custom duration when creating polls |
| Remove student | ✅ Done | Kick/Unkick functionality with real-time notification |
| Well-designed UI | ✅ Done | Modern purple theme matching Figma design |
| Chat popup | ✅ Done | Real-time chat between students and teachers |
| Past poll results | ✅ Done | Poll history with vote statistics and percentages |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas cloud)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Intervue_SDE_Assignment
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/live-polling
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

5. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

6. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

7. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```

8. **Open the application**
   - Navigate to `http://localhost:3000` (or the port shown in terminal)

---

## 🏗️ Project Structure

```
Intervue_SDE_Assignment/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ActivePoll.tsx  # Live polling interface
│   │   │   ├── CreatePoll.tsx  # Poll creation form
│   │   │   ├── PollCard.tsx    # Poll history card
│   │   │   ├── Chat.tsx        # Chat popup component
│   │   │   ├── StudentList.tsx # Student management modal
│   │   │   └── PollHistory.tsx # Past polls viewer
│   │   ├── context/
│   │   │   └── AuthContext.tsx # Authentication state management
│   │   ├── pages/
│   │   │   ├── Welcome.tsx     # Role selection page
│   │   │   ├── Dashboard.tsx   # Main application dashboard
│   │   │   ├── Login.tsx       # Login form
│   │   │   ├── Register.tsx    # Registration form
│   │   │   └── KickedOut.tsx   # Kicked student notification
│   │   ├── services/
│   │   │   ├── api.ts          # Axios API client
│   │   │   └── socket.ts       # Socket.IO client
│   │   └── types/
│   │       └── index.ts        # TypeScript interfaces
│   └── package.json
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts     # MongoDB connection
│   │   │   └── index.ts        # Environment config
│   │   ├── middleware/
│   │   │   └── auth.ts         # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── User.ts         # User schema (teacher/student)
│   │   │   ├── Poll.ts         # Poll schema with options
│   │   │   └── Chat.ts         # Chat message schema
│   │   ├── routes/
│   │   │   ├── auth.ts         # Authentication endpoints
│   │   │   ├── poll.ts         # Poll CRUD & voting
│   │   │   ├── students.ts     # Student management
│   │   │   └── chat.ts         # Chat endpoints
│   │   ├── socket.ts           # Socket.IO configuration
│   │   └── index.ts            # Server entry point
│   └── package.json
│
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user info | Authenticated |

### Polls
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/polls` | Get all polls | Authenticated |
| POST | `/api/polls` | Create new poll | Teacher only |
| POST | `/api/polls/:id/start` | Start a poll | Teacher only |
| POST | `/api/polls/:id/stop` | Stop a poll | Teacher only |
| POST | `/api/polls/:id/vote` | Vote on a poll | Student only |
| DELETE | `/api/polls/:id` | Delete a poll | Teacher only |

### Students Management
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/students` | Get all students | Teacher only |
| POST | `/api/students/:id/kick` | Kick a student | Teacher only |
| POST | `/api/students/:id/unkick` | Restore a student | Teacher only |

### Chat
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/chat` | Get chat messages | Authenticated |
| POST | `/api/chat` | Send a message | Authenticated |
| DELETE | `/api/chat` | Clear all messages | Teacher only |

---

## 🔄 Real-time Events (Socket.IO)

### Server → Client Events
| Event | Payload | Description |
|-------|---------|-------------|
| `pollStarted` | `Poll` object | New poll has started |
| `pollEnded` | `Poll` object | Poll has ended |
| `voteUpdate` | `{ pollId, options }` | Vote count updated |
| `pollDeleted` | `{ pollId }` | Poll was deleted |
| `newMessage` | `ChatMessage` object | New chat message received |
| `chatCleared` | - | Chat was cleared by teacher |
| `studentKicked` | `{ studentId, userId }` | Student was kicked from session |

---

## 👥 User Roles & Permissions

### 👨‍🏫 Teacher
- ✅ Create polls with multiple options (2-6 choices)
- ✅ Set correct answer for each poll
- ✅ Configure poll duration (time limit)
- ✅ Start and stop polls manually
- ✅ View real-time voting results with percentages
- ✅ Access complete poll history
- ✅ Manage students (kick/unkick)
- ✅ Clear chat messages
- ✅ Send chat messages

### 👨‍🎓 Student
- ✅ Join polling session
- ✅ Vote on active polls (one vote per poll)
- ✅ View results after voting or poll ends
- ✅ Participate in chat
- ✅ Receive real-time notifications
- ❌ Cannot vote after being kicked

---

## 🎨 UI/UX Features

- **Modern Purple Theme** - Consistent color scheme (`#7765DA` primary)
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Real-time Updates** - No page refresh needed for any action
- **Floating Chat Button** - Accessible 💬 button from any screen
- **Progress Bars** - Visual representation of vote distribution
- **Countdown Timer** - Live countdown for active polls
- **Status Badges** - "LIVE" indicator for active polls
- **Checkbox-style Voting** - Clean option selection UI
- **Toast Notifications** - Feedback for user actions

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI component library |
| TypeScript | Type-safe development |
| Vite | Fast build tool & dev server |
| React Router v6 | Client-side routing |
| Socket.IO Client | Real-time WebSocket communication |
| Axios | HTTP client for API calls |
| CSS Modules | Scoped component styling |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express | Web application framework |
| TypeScript | Type-safe development |
| MongoDB | NoSQL database |
| Mongoose | MongoDB ODM |
| Socket.IO | WebSocket server |
| JWT | Token-based authentication |
| bcryptjs | Password hashing |

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth with expiration
- **Password Hashing** - bcrypt with salt rounds
- **Role-based Access** - Teacher/Student permission control
- **Input Validation** - Server-side validation for all inputs
- **CORS Configuration** - Controlled cross-origin requests

---

## 📱 Application Flow

### Teacher Flow
```
Welcome → Register/Login → Dashboard → Create Poll → Start Poll → View Results → End Poll
                                    ↓
                              Manage Students (Kick/Unkick)
                                    ↓
                              Chat with Students
```

### Student Flow
```
Welcome → Register/Login → Dashboard → Wait for Poll → Vote → View Results
                                    ↓
                              Chat with Teacher/Students
                                    ↓
                         (If Kicked) → Kicked Out Page → Return to Welcome
```

---

## 🧪 Testing the Application

1. **Register a Teacher account**
   - Select "Teacher" role on welcome page
   - Fill registration form

2. **Register a Student account** (in another browser/incognito)
   - Select "Student" role on welcome page
   - Fill registration form

3. **Create a Poll (as Teacher)**
   - Click "+ Ask a Question"
   - Enter question and options
   - Set duration and correct answer
   - Click "Create Poll"

4. **Start the Poll (as Teacher)**
   - Click "Start" on the poll card

5. **Vote (as Student)**
   - Select an option
   - Click "Submit"

6. **View Live Results**
   - Both teacher and student see real-time vote updates

7. **Test Chat**
   - Click 💬 button to open chat
   - Send messages between users

8. **Test Kick Feature (as Teacher)**
   - Click "Manage Students"
   - Click "Kick" on a student
   - Student is redirected to "Kicked Out" page

---

## 📄 License

This project is created as part of the **Intervue SDE Assignment**.

---

## 👨‍💻 Author

Built with ❤️ for the Live Polling System Assignment

---

## 🙏 Acknowledgments

- Assignment provided by Intervue
- UI design inspiration from Figma mockups
