# MarketPulse 📈

Advanced NSE & BSE Equity Research Terminal powered by **Groq** and **Yahoo Finance**.

## ✨ Features

- **Real-time Market Ticker**: Live NIFTY 50 & SENSEX tracking.
- **AI Market Scanner**: Automated scanning of top 40 equities with AI-generated trade signals.
- **Technical Analysis Engine**: Professional implementation of RSI, MACD, Supertrend, ATR, and ADX.
- **Advanced Charting**: TradingView Lightweight Charts with multi-EMA overlays and volume analysis.
- **AI Deep Dive**: Search-grounded research reports via Groq, analyzing news, earnings, and catalysts.
- **Mobile First UI**: Fully responsive terminal experience with a premium dark-mode aesthetic.
- **Single-Password Security**: Protected terminal access for personalized research.

## 🛠️ Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd marketpulse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file in the root:
   ```env
   GROQ_API_KEY=your_key_here
   APP_PASSWORD=your_password
   NEXT_PUBLIC_APP_NAME=MarketPulse
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🚀 Deployment to Vercel

1. Push your code to a GitHub repository.
2. Connect the repository to [Vercel](https://vercel.com/).
3. Add `GROQ_API_KEY` and `APP_PASSWORD` as Environment Variables in the Vercel dashboard.
4. Deploy!

## 📊 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **AI**: Groq
- **Data**: Yahoo Finance (yahoo-finance2)
- **Charts**: Lightweight Charts (TradingView)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
