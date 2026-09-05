# Quick Start Guide for Cyher WhatsApp Bot

## 🚀 Super Quick Setup (30 seconds)

### **Windows Users:**
```bash
# Double-click this file:
setup.bat

# Then to start the bot:
start.bat
```

### **Mac/Linux Users:**
```bash
# Run setup
chmod +x setup.sh
./setup.sh

# Then to start the bot
chmod +x start.sh
./start.sh
```

### **Or Manually (Universal):**
```bash
# Navigate to bot directory
cd whatsapp-bot

# Install dependencies
npm install

# Start the bot
npm start
```

## 📱 Next Steps

1. **Run the setup/start script** - A QR code will appear
2. **Open WhatsApp on your phone** - Go to Settings > Linked Devices
3. **Scan the QR code** - Use your phone camera
4. **Done!** Your bot is now online 🎉

## 💬 Test Your Bot

Send these messages:
- `hello` - Bot greets you
- `/help` - See all commands
- `/stats` - View statistics
- `Ask me anything!` - AI responds

## ⚙️ Configuration

Edit `whatsapp-bot/.env` to customize:
- `BOT_NAME` - Change bot name
- `LOG_LEVEL` - Set logging detail (debug, info, warn, error)
- `ENABLE_AI` - Turn AI on/off

## 🆘 Troubleshooting

**QR code not showing?**
```bash
rm -rf .wwebjs_cache
npm start
```

**Port already in use?**
```bash
PORT=4000 npm start
```

**Dependencies error?**
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**That's it! Your WhatsApp bot is ready to roll! 🤖**
