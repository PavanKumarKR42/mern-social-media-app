# MERN Social Media App

A modern social media application built using the **MERN stack** (MongoDB, Express, React, Node.js). This app allows users to interact, share posts, follow/unfollow other users, and much more, providing an engaging social media experience.

## Technologies Used

- **Frontend**:
  - React
  - React Router
  - Axios
  - CSS
  - Bootstrap (for responsive design)
  
- **Backend**:
  - Node.js
  - Express.js
  - MongoDB (NoSQL Database)
  - JWT Authentication (for secure login and session management)
  - bcrypt (for password hashing)

- **DevOps**:
  - Docker (for containerization)
  - Jenkins (for CI/CD)
  - AWS EC2 (for deployment)

## Features

- **User Authentication**:
  - Register, login, and authentication using JWT.
  - Password encryption using bcrypt.
  
- **User Profile**:
  - Users can update their profile information.
  - Display followers and following counts.
  
- **Post Creation**:
  - Users can create, edit, and delete posts.
  - Upload images along with posts.

- **Follow/Unfollow**:
  - Users can follow or unfollow other users.

- **Real-time Updates**:
  - Real-time updates for new posts and notifications.

## Installation

### Prerequisites

- Node.js and npm (for backend and frontend development).
- Docker (for containerization and deployment).
- Git (for version control).

### Clone the Repository

Clone this repository to your local machine using the following command:

```bash
git clone https://github.com/PavanKumarKR42/mern-social-media-app.git
```

### Backend Setup

1. Navigate to the backend folder:
   
   ```bash
   cd mern-social-media-app/backend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory to store environment variables (like MongoDB URI, JWT_SECRET, etc.).

4. Start the backend server:

   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend folder:

   ```bash
   cd mern-social-media-app/frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the frontend server:

   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`.

### Running the App with Docker

1. Build and run the app using Docker Compose:

   ```bash
   docker-compose up --build
   ```

   This will set up the frontend and backend containers and run them together.

2. Visit the app on:

   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## CI/CD Pipeline

This project is integrated with Jenkins to automate the Continuous Integration (CI) and Continuous Deployment (CD) process.

- **CI Pipeline**: The CI pipeline is configured to automatically build and test the app whenever there is a change in the GitHub repository.
- **CD Pipeline**: After a successful build, the app is deployed to AWS EC2.

## Deployment

The app is deployed on **AWS EC2** using **Docker** and **Jenkins** for automated deployment.

- The backend runs on port `5000`.
- The frontend runs on port `3000`.


## Acknowledgements

- [Docker](https://www.docker.com/)
- [Jenkins](https://www.jenkins.io/)
- [AWS EC2](https://aws.amazon.com/ec2/)
- [MERN Stack](https://www.mongodb.com/mern-stack)

## Contact

For any questions, feel free to reach out to [Pavan Kumar K R](mailto:pavankumarkr42@gmail.com).

