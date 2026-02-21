<a href="https://www.geminicoder.io">
  <img alt="GeminiCoder" src="./public/og-image.png">
  <h1 align="center">GeminiCoder</h1>
</a>

<p align="center">
  An open source Claude Artifacts – generate small apps with one prompt. Powered by Google Gemini.
</p>

## Tech stack

- [Gemini 2.0 Flash](https://ai.google.dev/) from Google for the LLM
- [Sandpack](https://sandpack.codesandbox.io/) for the code sandbox
- Next.js app router with Tailwind
- Helicone for observability
- Plausible for website analytics

## Cloning & running

1. Clone the repo: `git clone https://github.com/Nutlope/llamacoder`
2. Create a `.env` file and add your API keys:
   - **[Google AI API key](https://aistudio.google.com/app/apikey)**: `GOOGLE_GENERATIVE_AI_API_KEY=<your_google_ai_api_key>`
   - **[CSB API key](https://codesandbox.io/signin)**: `CSB_API_KEY=<your_csb_api_key>`
   - **Database URL**: Use [Neon](https://neon.tech) to set up your PostgreSQL database and add the Prisma connection string: `DATABASE_URL=<your_database_url>`
3. Run `npm install` and `npm run dev` to install dependencies and run locally

## Contributing

For contributing to the repo, please see the [contributing guide](./CONTRIBUTING.md)
