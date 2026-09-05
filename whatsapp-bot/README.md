# Cyher WhatsApp Bot 🤖

An AI-powered WhatsApp bot built with Node.js and OpenAI integration. Inspired by Cyher bot features.

## Features ✨

- 🤖 **AI-Powered Responses** - Uses OpenAI GPT for intelligent conversations
- 💬 **Natural Language Understanding** - Context-aware conversations with memory
- 🎯 **Command System** - Built-in commands like `/help`, `/start`, `/stats`, etc.
- 📱 **Full WhatsApp Support** - Works with WhatsApp Web
- 🔄 **Message Queue** - Prevents rate limiting with intelligent queueing
- 📊 **Statistics** - Track active conversations and bot performance
- 🎨 **Typing Indicators** - Real typing simulation for better UX
- 📸 **Media Support** - Handle images, videos, and files
- 🚀 **Easy Deployment** - REST API endpoints for monitoring and control

## Prerequisites 📋

- Node.js 16+
- npm or yarn
- OpenAI API key (optional, fallback to default responses)
- WhatsApp account

## Installation 🔧

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/CypherX.git
cd CypherX/whatsapp-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```
OPENAI_API_KEY=your_openai_api_key_here
BOT_NAME=Cyher Bot
ENABLE_AI=true
```

## Usage 🚀

### Start the bot
```bash
npm start
```

### Development mode (with auto-reload)
```bash
npm run dev
```

The first time you run the bot, you'll see a QR code in the terminal. Scan it with your WhatsApp app to authenticate.

## Commands 📜

Once the bot is running, send these commands:

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/start` | Get started with the bot |
| `/menu` | Display main menu |
| `/clear` | Clear conversation history |
| `/stats` | View bot statistics |
| `/about` | Information about the bot |

## API Endpoints 🔌

The bot also exposes REST API endpoints:

### Health Check
```
GET /api/health
```

### Bot Status
```
GET /api/status
```

### Statistics
```
GET /api/stats
```

### Get All Chats
```
GET /api/chats
```

### Send Message (Admin)
```
POST /api/send-message
Content-Type: application/json

{
  "phone": "1234567890",
  "message": "Hello!"
}
```

## Project Structure 📁

```
whatsapp-bot/
├── src/
│   ├── index.js                 # Main entry point
│   ├── routes.js                # API routes
│   ├── handlers/
│   │   ├── messageHandler.js    # Main message handling
│   │   └── commandHandler.js    # Command routing
│   ├── services/
│   │   └── aiService.js         # OpenAI integration
│   └── utils/
│       └── logger.js            # Logging utility
├── .env.example                 # Environment template
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Tips & Best Practices 💡

1. **Rate Limiting** - The bot implements message queueing to avoid WhatsApp rate limits
2. **Conversation Memory** - Stores last 20 messages per user for context
3. **Error Handling** - Graceful fallbacks when AI is unavailable
4. **Typing Simulation** - Adds human-like delays before responding

## Troubleshooting 🔧

### QR Code not appearing?
```bash
# Clear cache and restart
rm -rf .wwebjs_cache
npm start
```

### Messages not sending?
- Check WhatsApp connection status: `GET /api/status`
- Ensure phone number format is correct (include country code)

### AI responses not working?
- Verify `OPENAI_API_KEY` is set correctly
- Check that you have API credits in your OpenAI account
- Bot will fallback to default responses if AI fails

## Security Notes 🔒

⚠️ **Important:**
- Never commit `.env` file with real API keys
- Use environment variables for sensitive data
- The API endpoints are public - consider adding authentication in production
- WhatsApp may rate-limit excessive messages

## License 📄

MIT License

---

**Happy botting! 🎉**
