# Dragon's Bindery

A fantasy-themed e-commerce platform for handcrafted books and journals.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- MongoDB (v6 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dragons-bindery.git
   cd dragons-bindery
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following content:
   ```
   MONGODB_URI=mongodb://localhost:27017/dragons-bindery
   PORT=5000
   NODE_ENV=development
   ```

## Running the Application

### Start MongoDB
Make sure MongoDB is running locally:
```bash
# Start MongoDB (command may vary based on your installation)
mongod
```

### Start the Backend Server
Option 1: Start just the backend server
```bash
# From the project root
cd backend
node server.js
```

Option 2: Using nodemon (recommended for development)
```bash
# From the project root
npm run start:server
```

The backend server will start on http://localhost:5000

### Start the Frontend Application
Option 1: Start just the frontend application
```bash
# From the project root
npm start
```
or
```bash
ng serve
```

Option 2: Start both frontend and backend simultaneously (recommended)
```bash
# From the project root
npm run start:dev
```

The frontend application will start on http://localhost:4200

### Seed Data (Optional)
To populate the database with initial product data:
```bash
# From the project root
node backend/seed-data.js
```

## Development

### Running Tests

Backend tests:
```bash
npm run test:api
```

Frontend tests:
```bash
npm test
```

End-to-end tests:
```bash
npm run e2e
```

Run all tests:
```bash
npm run test:all
```

### Building for Production
```bash
npm run build
```

## Features

- Product browsing and filtering
- Shopping cart functionality
- Secure checkout with Stripe
- Admin dashboard for product management
- User authentication
- Responsive design

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
