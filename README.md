
# InstaStyle Project

This is a generated project from the InstaStyle AI application.

## Setup

1.  Create a file named `.env` in the root of the project.
2.  Add your Google Gemini API key to it:
    ```
    API_KEY=your_gemini_api_key_here
    ```

## Running Locally

To run this project locally, you'll need Node.js and npm.

```bash
# This project uses esbuild for development.
# Install it globally or use npx.
npm install -g esbuild

# Run the development server
npm start 
# (You may need to add a start script to package.json: "start": "esbuild --servedir=./ --bundle index.tsx --outfile=bundle.js")
```

## Deployment

For detailed instructions on how to deploy this project to Vercel, Hugging Face (Docker), or a VPS, please refer to the comprehensive guide inside the downloaded HTML file.
