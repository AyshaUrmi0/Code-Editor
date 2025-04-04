# Interactive Code Editor

A modern, feature-rich web-based code editor built with Next.js and Monaco Editor. This project provides a powerful environment for writing and executing code in multiple programming languages directly in your browser.

🔗 **[Try it live!](https://code-editor-u81n.onrender.com/)**

![Code Editor Screenshot](screenshot.png)

## Features

- 🌈 **Multi-language Support**
  - JavaScript
  - TypeScript
  - Python (via Pyodide)
  - HTML (with live preview)
  - CSS
  - JSON

- 🎨 **Rich Editor Features**
  - Syntax highlighting
  - Auto-completion
  - Error detection
  - Format on type/paste
  - Line numbers
  - Word wrap
  - Bracket pair colorization

- 🌓 **Theme Support**
  - Light and dark themes
  - Smooth transitions
  - Modern UI design

- 🚀 **Code Execution**
  - Real-time code execution
  - Interactive console output
  - HTML live preview
  - Python runtime support
  - Captured console logs
  - Error handling

- 💻 **Developer Experience**
  - Responsive design
  - Clear error messages
  - Loading states
  - Output history
  - Easy to clear results

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select a Language**: Choose from JavaScript, TypeScript, Python, HTML, CSS, or JSON using the language dropdown.

2. **Write Code**: Enter your code in the editor. The editor provides syntax highlighting and auto-completion for your chosen language.

3. **Run Code**: Click the "Run" button to execute your code. Output will appear in the console panel below.

4. **View Results**: 
   - For HTML, a live preview appears below the editor
   - For other languages, check the console output panel
   - Error messages are highlighted in red
   - Success messages are highlighted in green

5. **Clear Output**: Use the "Clear Output" button to reset the console panel.

## Dependencies

- Next.js
- Monaco Editor
- Pyodide (for Python execution)
- Shadcn UI components
- Lucide React (for icons)
- Tailwind CSS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the powerful code editing capabilities
- [Pyodide](https://pyodide.org/) for bringing Python to the browser
- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components

## Deployment

The project is currently deployed on Render and can be accessed at:
[https://code-editor-u81n.onrender.com/](https://code-editor-u81n.onrender.com/)

### Self-Hosting
If you want to deploy your own instance, you can:

1. Fork this repository
2. Deploy to Render:
   - Connect your Render account to GitHub
   - Create a new Web Service
   - Select your forked repository
   - Use the following settings:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
     - Node.js environment

Alternatively, you can deploy to other platforms like Vercel, Netlify, or your own server. 