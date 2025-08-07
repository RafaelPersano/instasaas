
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
# Open http://localhost:8000 in your browser.
```

## Deployment

### Option 1: Vercel (Recommended)

1.  Push the project folder to a GitHub repository.
2.  Import the project into Vercel from your Git repository.
3.  Configure the **Build & Development Settings**:
    - **Build Command:** `npm run build` (Vercel should detect this automatically).
    - **Output Directory:** `.` (You MUST set this to the project root, as that's where `bundle.js` is created).
    - **Install Command:** `npm install` (Should be the default).
4.  In your Vercel project settings, go to **Environment Variables** and add your `API_KEY`. If using the SaaS version, also add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5.  Deploy. Vercel will now build and deploy your application correctly.

### Option 2: VPS with Docker (Advanced)

1.  Ensure you have Docker and Docker Compose installed on your VPS.
2.  If using the SaaS version, create a project on Supabase and run the content of `db_schema.sql` in the SQL Editor to create your table.
3.  Copy the project files to your VPS.
4.  Make sure your `.env` file is correctly set up with all required keys.
5.  Run the application in the background:
    ```bash
    docker-compose up --build -d
    ```
6.  The application will be accessible on port 7860 of your VPS. You may want to configure a reverse proxy (like Nginx) to handle SSL.
