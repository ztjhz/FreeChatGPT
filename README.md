# Better ChatGPT PLUS
<p>
    <a href="https://animalnots.github.io/BetterChatGPT-PLUS/" target="_blank"><img src="public/public.jpg" alt="Better ChatGPT" width="150" /></a>
</p>

![License](https://img.shields.io/github/license/animalnots/BetterChatGPT-PLUS?style=flat-square)
![Stars](https://img.shields.io/github/stars/animalnots/BetterChatGPT-PLUS?style=flat-square)
![Forks](https://img.shields.io/github/forks/animalnots/BetterChatGPT-PLUS?style=flat-square)
![Issues](https://img.shields.io/github/issues/animalnots/BetterChatGPT-PLUS?style=flat-square)
![Pull Requests](https://img.shields.io/github/issues-pr/animalnots/BetterChatGPT-PLUS?style=flat-square)
<a href="https://discord.gg/2CKfAbAJrH"><img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0b52aa9e99b832574a53_full_logo_blurple_RGB.png" height="20"></a>

## 🗳️ Feature Prioritization

Help us decide what to build next by voting for features on [Canny.io](https://betterchatgpt.canny.io/feature-requests). Want a feature urgently? Push it to the front with a $100 bounty!

## 🚀 Introducing Better ChatGPT PLUS

Experience free, limitless conversational AI with OpenAI's ChatGPT API. [Visit our website](https://animalnots.github.io/BetterChatGPT-PLUS/) to start.

### Key Features

- **Regional Proxy**: Bypass ChatGPT restrictions.
- **Prompt Library**
- **Chat Organization**: Folders & filters.
- **Token & Pricing Info**
- **ShareGPT Integration**
- **Custom Model Parameters**
- **Versatile Messaging**: Chat as user/assistant/system.
- **Edit & Reorder Messages**
- **Auto-Save & Download Chats**
- **Google Drive Sync**
- **Multilingual Support (i18n)**

### PLUS Fork Enhancements

We're continuously improving Better ChatGPT PLUS. Here are the key differences and recent updates:

- **Small UI Enhancements**: Sleeker, more intuitive interface including an updated attachment icon, now moved to the bottom.
- **Clipboard Support**: Paste images directly from the clipboard.
- **Image Interface**: Support for the image interface for supported models.
- **Title Model Selection**: Allow specifying a model for chat title generation.
- **Improved Import**: Fixed issues when importing JSON and better GPT data.
- **Models Parsing**: Added support for parsing models based on OpenRouter API.
- **Token Count for Images**: Implemented token count and cost calculation for images.
- **Zoom Functionality**: Added zoom functionality for images.
- **Large File Handling**: Improved handling of large files to prevent storage overflow.
- **OpenAI Import Fix**: Fixed import issues with OpenAI chat branches, ensuring the deepest branch with the most messages is imported.

Contributions are welcome! Feel free to submit [pull requests](https://github.com/animalnots/BetterChatGPT-PLUS/pulls).

## 🚀 Getting Started

1. **Visit**: [Our Website](https://animalnots.github.io/BetterChatGPT-PLUS/)
2. **API Key**: Enter your OpenAI API Key from [here](https://platform.openai.com/account/api-keys)
3. **Proxy**: Use [ChatGPTAPIFree](https://github.com/ayaka14732/ChatGPTAPIFree) or host your own.

## 🖥️ Desktop App

Download from [Releases](https://github.com/animalnots/BetterChatGPT-PLUS/releases)

| OS      | Download  |
| ------- | --------- |
| Windows | .exe      |
| MacOS   | .dmg      |
| Linux   | .AppImage |

### Desktop Features:

- Unlimited local storage
- Runs locally

## 🛠️ Host Your Own Instance

### Vercel

[Deploy with Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fanimalnots%2FBetterChatGPT-PLUS)

### GitHub Pages

1. **Star & Fork**: [This Repo](https://github.com/animalnots/BetterChatGPT-PLUS)
2. **Settings**: Navigate to `Settings` > `Pages`, select `GitHub Actions`
3. **Actions**: Click `Actions`, `Deploy to GitHub Pages`, then `Run workflow`

### Local Setup

1. Install [node.js](https://nodejs.org/en/) and [yarn/npm](https://www.npmjs.com/)
2. **Clone repo**: `git clone https://github.com/animalnots/BetterChatGPT-PLUS.git`
3. Navigate: `cd BetterChatGPT-PLUS`
4. **Install**: `yarn` or `npm install`
5. **Launch**: `yarn dev` or `npm run dev`

### Docker Compose

1. Install [docker](https://www.docker.com/)
2. **Build**: `docker compose build`
3. **Start**: `docker compose up -d`
4. **Stop**: `docker compose down`

### Build Desktop App

1. Install [yarn/npm](https://www.npmjs.com/)
2. **Build (Windows)**: `yarn make --win`

## ⭐️ Star & Support

[Star the repo](https://github.com/animalnots/BetterChatGPT-PLUS) to encourage development.
<br />[![Star History Chart](https://api.star-history.com/svg?repos=animalnots/BetterChatGPT-PLUS&type=Date)](https://github.com/animalnots/BetterChatGPT-PLUS/stargazers)

### Support Methods:

Support the original creator [here](https://github.com/ztjhz/BetterChatGPT?tab=readme-ov-file#-support)

## ❤️ Contributors

Thanks to all the [contributors](https://github.com/animalnots/BetterChatGPT-PLUS/graphs/contributors)!
<br /><a href="https://github.com/animalnots/BetterChatGPT-PLUS/graphs/contributors">
<img src="https://contrib.rocks/image?repo=animalnots/BetterChatGPT-PLUS" />
</a>

## 🚀 Update & Expand

### Adding New Settings

To add new settings, update these files:

```plaintext
public/locales/en/main.json
public/locales/en/model.json
src/assets/icons/AttachmentIcon.tsx
src/components/Chat/ChatContent/ChatTitle.tsx
src/components/Chat/ChatContent/Message/EditView.tsx
src/components/ChatConfigMenu/ChatConfigMenu.tsx
src/components/ConfigMenu/ConfigMenu.tsx
src/constants/chat.ts
src/store/config-slice.ts
src/store/migrate.ts
src/store/store.ts
src/types/chat.ts
src/utils/import.ts
```

### Updating Models

1. Download `models.json` from [OpenRouter](https://openrouter.ai/api/v1/models).
2. Save it as `models.json` in the root directory.
3. Run `node sortModelsJsonKeys.js` to organize the keys.
