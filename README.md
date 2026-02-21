<a href="https://www.llamacoder.io">
  <img alt="Llama Coder" src="./public/og-image.png">
  <h1 align="center">Llama Coder</h1>
</a>

<p align="center">
  An open source Claude Artifacts – generate small apps with one prompt. Powered by Google Gemini.
</p>

## Tech stack

- [Google Gemini](https://deepmind.google/technologies/gemini/) for the LLM and multimodal capabilities
- [Google Generative AI SDK](https://ai.google.dev/) for API integration
- [Supabase](https://supabase.com/) for PostgreSQL database and backend
- [Sandpack](https://sandpack.codesandbox.io/) for the code sandbox
- Next.js app router with Tailwind
- Prisma for ORM
- Plausible for website analytics

## Cloning & running

1. Clone the repo: `git clone https://github.com/Nutlope/llamacoder`
2. Create a `.env` file and add your API keys:
   - **[Google Generative AI API key](https://ai.google.dev/)**: `GOOGLE_GENERATIVE_AI_API_KEY=<your_google_api_key>`
   - **[CSB API key](https://codesandbox.io/signin)**: `CSB_API_KEY=<your_csb_api_key>`
   - **Database URL**: Use [Supabase](https://supabase.com/) to set up your PostgreSQL database and add the Prisma connection string: `DATABASE_URL=<your_supabase_database_url>`
3. Run `npm install` and `npm run dev` to install dependencies and run locally

## Contributing

For contributing to the repo, please see the [contributing guide](./CONTRIBUTING.md)
