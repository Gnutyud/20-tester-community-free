# 20 Tester Community

## Introduction

The 20 Tester Community is a web application designed to streamline the process of organizing Android app testing groups. It allows Android developers to create groups, invite members, and manage the testing process efficiently.

## Features

- **User Authentication:** Users can log in using their Google account.
- **Group Creation:** Users can create groups specifying the maximum number of members.
- **Group Joining:** Users can join existing groups created by others.
- **Group Management:** Groups transition through different statuses (OPEN, INPROGRESS, WAITING, COMPLETE) based on the number of members and their confirmation statuses.
- **Confirmation Process:** Members confirm becoming testers for each other's apps within the group.
- **Notifications:** Users receive notifications for various group activities, such as joining, leaving, confirming, and group completion, via email.

## Technologies Used

- **Next.js 14:** A React framework for building server-side rendered applications.
- **NextAuth:** A library for authentication in Next.js applications.
- **Prisma:** A modern database toolkit for Node.js and TypeScript.
- **Node.js:** A JavaScript runtime for building scalable network applications.
- **Nodemailer:** A module for sending emails using Node.js.

## Getting Started

### Prerequisites

Before running the application, make sure you have the following installed:

- Node.js and npm
- PostgreSQL database

### Installation

1. Clone this repository:

```bash
git clone <repository_url>
```

2. Install dependencies:

```bash
cd 20-tester-community
npm install
```

3. Set up environment variables:
Create a .env file in the root directory and add the following variables:

```bash
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
EMAIL_SERVICE=<email_service_provider>
EMAIL_USER=<email_user>
EMAIL_PASS=<email_password>
```
Replace placeholders with your actual values.

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Running the Application
To start the development server, run:

```bash
npm run dev
```

Visit http://localhost:3000 in your browser to access the application.

### Contributing
Contributions are welcome! Please feel free to submit issues and pull requests to improve the application.

### License
This project is licensed under the MIT License.
