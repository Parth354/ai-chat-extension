# AI Chat Extension for VS Code

An intelligent coding assistant that provides contextual help with your code, supports file attachments, and integrates seamlessly with your development workflow.

## Features

- 🤖 **AI-Powered Chat**: Get intelligent responses to your coding questions
- 📁 **File Context**: Attach files using @filename syntax
- 🎯 **Smart Context**: Automatically includes relevant workspace context
- 🎨 **Theme Aware**: Matches VS Code's light/dark theme
- 💾 **Persistent History**: Saves chat history per workspace
- 🔄 **Real-time Responses**: Streaming responses for better UX

## Installation

1. Clone this repository
2. Run `npm run build` to build the extension
3. Press F5 to run the extension in a new Extension Development Host window
4. Configure your OpenAI API key in VS Code settings

## Configuration

Open VS Code settings and configure:

- `aiChat.openaiApiKey`: Your OpenAI API key
- `aiChat.model`: Model to use (default: gpt-4)
- `aiChat.maxTokens`: Maximum tokens per response (default: 2048)

## Usage

1. Open the command palette (Ctrl+Shift+P)
2. Run "Open AI Chat" command
3. Start chatting with the AI assistant
4. Use @filename to attach files to your messages

## Development

### Build Commands

```bash
# Full build
npm run build

# Watch mode for development
npm run watch

# Build webview only
npm run build-webview
```

### Project Structure

- `src/` - Extension source code
- `webview/` - React frontend source
- `media/` - Built webview assets
- `out/` - Compiled extension
