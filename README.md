# CineVerse - Social Movie Review Platform

A professional full-stack movie discovery and social review platform inspired by Letterboxd.

## Features
- **Cinematic UI**: Dark theme, modern typography, and smooth animations.
- **Movie Discovery**: Real-time trending movies and categories using TMDB API.
- **Social Reviews**: Rate (1-5 stars) and review movies with spoiler tags.
- **Secure Auth**: JWT-based authentication with secure storage.
- **AWS KMS**: Secrets encryption for production security.
- **CI/CD**: Automated deployment pipeline for AWS EC2.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, TanStack Query.
- **Backend**: Node.js, Express, MongoDB, AWS SDK.
- **Database**: MongoDB Atlas.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- TMDB API Key
- AWS account (for KMS and CI/CD)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Movie_app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create .env and add your keys
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Create .env and add VITE_API_URL=http://localhost:5000/api
   npm run dev
   ```

## AWS KMS Integration
To encrypt your secrets for production:
1. Create a KMS Key in AWS.
2. Encrypt your `MONGODB_URI`, `JWT_SECRET`, and `TMDB_API_KEY` using the AWS CLI or Console.
3. Prefix the base64 encrypted string with `kms:` in your environment variables.
   Example: `TMDB_API_KEY=kms:AQECAHi...`

## CI/CD Pipeline
The project includes `buildspec.yml` and `appspec.yml` for AWS CodePipeline.
1. Connect your GitHub repo to CodePipeline.
2. Use CodeBuild with the provided `buildspec.yml`.
3. Use CodeDeploy to deploy to your EC2 instance.
