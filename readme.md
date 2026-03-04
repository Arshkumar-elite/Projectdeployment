## Social Authentication Gate (GitHub OAuth)

This project is a Node.js/Express application that uses GitHub OAuth (Passport) to authenticate users and then checks whether they follow a specific GitHub account. If the user follows the account, they see an authorized dashboard; otherwise they see a follow-gate screen with a retry link.

### Live Demo
- https://projectdeployment-steel.vercel.app

### Features
- GitHub OAuth login with Passport
- Session-based authentication and protected routes
- Follow-gate logic via GitHub API
- Simple UI screens for login, follow-gate, and authorized state

### Tech Stack
- Node.js, Express
- Passport GitHub strategy
- Axios for GitHub API calls
- Vercel serverless deployment

### Local Setup
1. Install dependencies:
   - npm install
2. Create a GitHub OAuth App:
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/auth/github/callback
3. Add environment variables in .env:
   - GITHUB_CLIENT_ID
   - GITHUB_CLIENT_SECRET
   - SESSION_SECRET
4. Start the server:
   - npm run dev
5. Open:
   - http://localhost:3000/login

### Environment Variables
GITHUB_CLIENT_ID=your_github_client_id  
GITHUB_CLIENT_SECRET=your_github_client_secret  
SESSION_SECRET=your_session_secret

### How It Works
- /login renders the GitHub login page
- /auth/github triggers OAuth login
- /auth/github/callback handles GitHub callback and session creation
- / is protected; it checks whether the user follows the target account and serves the appropriate UI
- /logout clears the session

### Summary
Built a Node.js/Express authentication gate using GitHub OAuth and Passport. Implemented session-based protected routes and a follow-verification rule via the GitHub API to conditionally authorize users. Deployed the app on Vercel with a clean, focused UI for login, follow-gate, and authorized states.
