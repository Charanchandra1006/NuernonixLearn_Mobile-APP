# NueronixLearn Mobile App

NueronixLearn is an **AI-Powered Adaptive Learning Platform**. This mobile application provides a seamless, dynamic learning experience tailored for students, and comprehensive course management tools for teachers and administrators.

The mobile app is built with **React Native** and **Expo**, utilizing a shared central backend to ensure perfect data consistency across all platforms.

## Key Features

- **Personalized Dashboards**: Distinct, data-rich interfaces for Students, Teachers, and Administrators.
- **Adaptive Study Plans**: AI-generated roadmaps that dynamically adjust based on your performance, cognitive load, and mastery.
- **Intelligent Chatbot**: Context-aware AI assistant that can provide instant explanations and clear conversation history.
- **Interactive Quizzes & Exams**: Real-time evaluation, tracking, and adaptive quiz generation.
- **Video Generation & AI Media**: Interactive learning paths driven by dynamically generated video content.
- **Cognitive Load Tracking**: Real-time monitoring of learning fatigue to optimize study efficiency.
- **Course & Exam Creation**: Fully integrated tools for teachers to create content, upload assets (via Expo Document Picker), and publish directly from their phone.

## Tech Stack

- **Framework**: React Native & Expo
- **Navigation**: React Navigation (Native Stack, Bottom Tabs)
- **State Management**: Zustand
- **Networking**: Axios
- **Styling**: Custom Theme/Colors System

## Setup and Installation

### 1. Prerequisites
- Node.js (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android Emulator / iOS Simulator, or the Expo Go app on a physical device.

### 2. Backend Configuration
The mobile app requires the NueronixLearn backend to be running.
By default, the app is configured to point to the local backend during development.

To change the API URL (e.g. for production or a different local port), update the `BASE_URL` in `src/services/api.ts`:
```typescript
// Example for Android Emulator hitting a local backend on port 5050
const BASE_URL = 'http://10.0.2.2:5050/api';
```

*(Note: Do NOT place database credentials in this repository. All database and API keys are securely managed by the backend server).*

### 3. Running the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo development server:
   ```bash
   npx expo start
   ```
3. Press `a` to open in Android Emulator, `i` for iOS Simulator, or scan the QR code with your Expo Go app.
