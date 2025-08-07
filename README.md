
# InstaStyle Project

This is a generated project from the InstaStyle AI application.

## Prerequisites

- Node.js and npm (or yarn/pnpm)
- A Git provider account (like GitHub).
- An account on a deployment platform like Vercel.
- A Google Gemini API Key.
- (For SaaS version) A Supabase account.

## Setup

1.  Unzip the project files.
2.  Open a terminal in the project directory and run `npm install` to install dependencies.
3.  Create a file named `.env` in the root of the project. This is for local development only.
4.  Add your Google Gemini API key to it:
    ```
    API_KEY=your_gemini_api_key_here
    ```

## Running Locally

To run this project for local development:

```bash
# This will start a development server with live reloading.
npm start 
# Open http://localhost:3000 in your browser (if the port is in use, it will use another).
```

## Deployment

### Option 1: Vercel (Recommended)

1.  Push the project folder to a GitHub repository.
2.  Import the project into Vercel from your Git repository.
3.  Configure the **Build & Development Settings**:
    - **Framework Preset:** None (or Other)
    - **Build Command:** `npm run build`
    - **Output Directory:** `dist` (This is crucial, Vercel needs to know where the output files are).
    - **Install Command:** `npm install` (Should be the default).
4.  In your Vercel project settings, go to **Environment Variables** and add your `API_KEY`.
    
5.  Deploy.

### Option 2: VPS with Docker (Advanced)

This project includes a production-ready Docker setup using a multi-stage build with Nginx.

1.  Ensure you have Docker and Docker Compose installed on your VPS.

3.  Copy the project files to your VPS.
4.  Create a file named `.env` in the root directory and add your keys (same as local setup).
5.  Run the application in the background:
    ```bash
    docker-compose up --build -d
    ```
6.  The application will be accessible on port 80 of your VPS. You may want to configure a reverse proxy to handle SSL.
