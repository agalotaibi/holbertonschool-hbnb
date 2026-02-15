# HBnB Application
A simplified AirBnB clone application developed as part of the Holberton School curriculum.

## 📋 Project Overview

This project is divided into multiple parts, each focusing on different aspects of application development:

### Part 1: Architecture & Design Documentation
Complete technical documentation including:
- High-Level Package Diagrams
- Detailed Class Diagrams for Business Logic
- API Sequence Diagrams
- Technical Design Document

**Location:** `part1/`

### Part 2: Business Logic and API Implementation
Implementation of RESTful API endpoints and core business logic:
- User management
- Place listings
- Reviews system
- Amenities management
- In-Memory data storage

**Location:** `part2/`

### Part 3: Enhanced Backend with Authentication and Database Integration
Secure backend with JWT authentication and persistent database:
- User authentication with JWT tokens
- Role-based access control (Admin/Regular Users)
- SQLite database with SQLAlchemy ORM
- Password hashing with bcrypt
- Database schema and relationships
- ER diagrams and database documentation

**Location:** `part3/`

### Part 4: Dynamic Frontend Development
- Development of a responsive client-side interface to interact with the backend API:
- Dynamic Content: Populating place listings and details using JavaScript (DOM manipulation).
- API Integration: Using the Fetch API to communicate with the backend endpoints.
- Client-Side Authentication: Managing user sessions via cookies and JWT tokens.
- Interactive Features: Price filtering, form handling (Login, Reviews), and search functionality.
- Protected Routes: Client-side redirection for unauthenticated users on secure pages.

**Location:** `part4/`

---

## 🏗 Architecture

The application follows a three-layer architecture:

- **Presentation Layer:** API endpoints (Flask-RESTx)
- **Business Logic Layer:** Models & validation
- **Persistence Layer:** Data storage (In-Memory Repository in Part 2, SQLite with SQLAlchemy in Part 3)

---

## 📚 Core Entities

- **User:** User accounts with email, password (hashed), and admin privileges
- **Place:** Property listings with location, pricing, and owner information
- **Review:** User reviews with ratings (1-5) and text content
- **Amenity:** Property features and facilities (WiFi, Pool, etc.)

---

## 🛠 Technologies

- **Python 3.10:** Programming language
- **Flask:** Web framework
- **Flask-RESTx:** REST API with Swagger documentation
- **Flask-JWT-Extended:** JWT authentication and authorization
- **Flask-Bcrypt:** Password hashing
- **SQLAlchemy:** ORM for database operations
- **SQLite:** Development database
- **MySQL:** Production database (configured in Part 3)
- **UML & Mermaid.js:** System design and database diagrams

---

## 📖 Documentation

- **Technical Design Document:** `part1/3. Technical Design Document: HBnB Project.pdf`
- **UML Diagrams:** `part1/diagrams/`
- **API Documentation:** Available at `/api/v1/` when running the application
- **Database Diagrams:** Available at `part3/README.md`

---

## 🤝 Contributors

- Amaal AlOtaibi
- Alanoud Alsmail
- Norah Alnujidi
