# Arda Altunel Portfolio

A modern, responsive personal portfolio website designed for deployment on GitHub Pages and Vercel.

This project was developed to showcase my projects, freelance services, social profiles, and technical skills through a modern and user-friendly interface.

## 🌍 Live Website

🔗 https://ardaltunel.vercel.app

---

## 📸 Preview

<p align="center">
  <img width="1884" height="907" alt="Arda Altunel portfolio website preview" src="https://github.com/user-attachments/assets/59e9c0e9-b640-4649-ba4e-a20add5ed6de" />
</p>

---

# ✨ Features

* Modern and responsive design
* GitHub Pages support
* Automated data update system
* GitHub pinned repository integration
* Bionluk service integration
* Fully static website architecture
* SEO-friendly structure
* Fast loading performance
* Mobile-friendly user experience
* AI-powered chatbot integration
* Vercel serverless function support

---

# 🚀 Technologies Used

<p align="left">
  <img src="https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/GitHub_Pages-121013?style=for-the-badge&logo=github&logoColor=white">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white">
</p>

---

# 📂 Project Structure

```text
.
├── api/
│   └── chat.js                # Vercel serverless chatbot endpoint
├── assets/                    # CSS, JavaScript, images, and fonts
├── cache/                     # Cached project and service data
├── .github/
│   └── workflows/             # GitHub Actions workflow files
├── build-static.mjs           # Static site build script
├── index.template.html        # Main HTML template
├── index.html                 # Generated static website
└── .nojekyll                  # Disables Jekyll processing
```

---

# ⚙️ Running Locally

Generate the static website:

```bash
node build-static.mjs
```

Start a local development server:

```bash
python -m http.server 4173 --bind 127.0.0.1
```

Then open the following address in your browser:

```text
http://127.0.0.1:4173/
```

---

# 🤖 AI Chatbot Setup

The chatbot interface is included in the static website. However, the OpenAI API key must never be placed directly in frontend code.

Chatbot responses are generated through the Vercel serverless function located at:

```text
api/chat.js
```

## Vercel Environment Variables

Add the following environment variables to your Vercel project:

```text
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini
ALLOWED_ORIGINS=https://ardaltunel.github.io,https://your-vercel-domain.vercel.app
```

> ⚠️ **Security Notice:** Never commit your OpenAI API key to GitHub or expose it in client-side JavaScript.

Because GitHub Pages only supports static websites, the `/api/chat` endpoint cannot run directly on GitHub Pages.

To use the chatbot on the live GitHub Pages domain, you can connect the repository to Vercel or define the public URL of an external backend:

```html
<script>
  window.ARDA_CHAT_API_URL = "https://your-vercel-domain.vercel.app/api/chat";
</script>
```

The frontend will then send chatbot requests to the configured Vercel serverless endpoint.

---

# 🚀 Deploying to GitHub Pages

1. Upload the project files to the root directory of your GitHub repository.
2. Open the repository settings.
3. Navigate to the `Pages` section.
4. Select the appropriate deployment branch and root directory.
5. Open the GitHub Actions tab.
6. Run the following workflow:

```text
Update static site data
```

After the workflow is completed, the generated static files can be deployed through GitHub Pages.

---

# ▲ Deploying to Vercel

1. Import the GitHub repository into Vercel.
2. Configure the required environment variables.
3. Deploy the project.
4. Verify that the `/api/chat` serverless endpoint is working.
5. Add the Vercel domain to the `ALLOWED_ORIGINS` environment variable.

Vercel is required for server-side functionality such as the AI chatbot endpoint.

---

# 🔄 Automated Data Update System

The following GitHub Actions workflow manages automated content updates:

```text
.github/workflows/update-static-site.yml
```

The workflow performs the following operations:

* Fetches Bionluk services
* Fetches pinned GitHub repositories
* Updates the `cache/*.json` files
* Generates the static HTML output
* Commits updated files automatically
* Keeps portfolio content synchronized with external data sources

---

# 🏗️ Static Build Process

The portfolio uses a simple static site generation workflow.

The `build-static.mjs` script:

1. Reads data from the cache files.
2. Processes the HTML template.
3. Inserts updated project and service information.
4. Generates the final `index.html` file.
5. Prepares the website for static hosting.

This structure allows the website to remain fast and compatible with GitHub Pages while still supporting automatically updated content.

---

# 🎯 Project Purpose

This project was developed to:

* Build a modern personal portfolio
* Gain practical experience with GitHub Pages
* Learn static site generation concepts
* Develop automated data update workflows
* Improve responsive frontend development skills
* Integrate external services into a static website
* Learn GitHub Actions automation
* Add secure AI functionality through serverless architecture

---

# 📄 License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by **Arda Altunel**
