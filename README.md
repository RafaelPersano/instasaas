
# InstaStyle Project

This is a generated project from the InstaStyle AI application.

## Prerequisites

- Node.js and npm (or yarn/pnpm)
- An account on a deployment platform like Vercel or a VPS provider.
- A Google Gemini API Key.
- (For SaaS version) A Supabase account.

## Setup

1.  Unzip the project files.
2.  Open a terminal in the project directory and run `npm install` to install dependencies.
3.  Create a file named `.env` in the root of the project.
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

### Option 1: Vercel (Recommended for Standalone)

1.  Push the project folder to a GitHub repository.
2.  Connect your repository to Vercel.
3.  Vercel will automatically detect it's a static project with a build step. It will use the `npm run build` command.
4.  In your Vercel project settings, go to "Environment Variables" and add your `API_KEY`. If using the SaaS version, also add `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
5.  Vercel will build and deploy your application.

### Option 2: VPS with Docker (Recommended for SaaS)

1.  Ensure you have Docker and Docker Compose installed on your VPS.
2.  If using the SaaS version, create a project on Supabase. Go to the 'SQL Editor', paste the content of `db_schema.sql` and run it to create your table.
3.  Copy the project files to your VPS.
4.  Make sure your `.env` file is correctly set up with all required keys.
5.  Run the application in the background:
    ```bash
    docker-compose up --build -d
    ```
6.  The application will be accessible on port 7860 of your VPS. You may want to configure a reverse proxy (like Nginx) to handle SSL and serve it on port 80/443.

### Option 3: Hugging Face Spaces (Docker)
1.  Create a new 'Space' on Hugging Face, choosing the 'Docker' SDK.
2.  Upload the project files to the Space repository.
3.  In the Space settings, add your `API_KEY` (and Supabase keys if needed) as 'Secrets'.
4.  The Space will build the Docker image and start the application.
