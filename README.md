# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment variables

This application uses environment variables to configure its connection to external services like Firebase. You must configure these before running the application.

1.  **Create a `.env` file:** In the root directory of the project, create a new file named `.env`. This file is listed in `.gitignore` and will not be committed to your repository.
2.  **Add your configuration:** Open the `.env` file and add the necessary key-value pairs. For example, for Firebase, you would add your Firebase project's configuration details:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
    NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
    ```

    You can get these values from the Firebase console by navigating to your project's settings.

## Running the application in development

To run the application in a local development environment, you will need to open two separate terminals.

**Terminal 1: Start the Genkit AI server**

In your first terminal, run the following command to start the Genkit server, which powers the AI features. The `--watch` flag will automatically restart the server when you make changes to AI-related files.

```bash
npm run genkit:watch
```

**Terminal 2: Start the Next.js web server**

In your second terminal, run the following command to start the Next.js development server, which serves the user interface.

```bash
npm run dev
```

Once both servers are running, you can open your web browser and navigate to the address shown in the second terminal (usually `http://localhost:9002`) to see your application.

## Building the application for production

To build the application for production, you need to compile both the AI flows and the Next.js frontend. The configured `build` script handles this for you.

Run the following command in your terminal:

```bash
npm run build
```

This command executes `next build`, which automatically triggers the necessary steps to prepare your entire application for deployment, including the Genkit AI functionalities. After the build process is complete, the optimized and ready-to-deploy application will be located in the `.next` directory.
