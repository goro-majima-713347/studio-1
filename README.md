# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

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

To build the application for production, run the following command:

```bash
npm run build
```
