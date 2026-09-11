
# LearnSense

LearnSense is an **AI-Driven Personalized Learning and Academic Performance Prediction System**. It provides early risk alerts, topic mastery modeling, adaptive quizzes, and intelligent tutoring, all packaged as a native Android application powered by Google's Gemini API.

## Features

- **Unified State Management**: Manages all user data (Student, Faculty, Admin roles) locally via Room databases and Kotlin Coroutines/StateFlow.
- **Adaptive Quiz Engine**: Quizzes automatically scale difficulty based on student performance. Features a **Circuit Breaker** that halts the quiz and provides an educational concept review if a student misses 3 consecutive questions.
- **AI Study Assistant**: Uses the **Gemini API** directly on-device. The assistant dynamically reads the student's live risk scores and weak topics to generate highly personalized step-by-step tutoring.
- **Academic Dashboards**: Real-time insights into attendance, grades, and topic mastery.

## Getting Started

**Prerequisites:** [Android Studio](https://developer.android.com/studio)

### 1. Setup the Project
1. Open Android Studio.
2. Select **Open** and choose the root directory containing this project (`learnsense`).
3. Allow Android Studio to sync Gradle and fix any incompatibilities.

### 2. Configure Gemini API
1. Create a file named `.env` in the root project directory.
2. Set your Gemini API key in that file:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   *(See `.env.example` for reference)*

### 3. Run the App
1. Build the project.
2. Run the app on an Android Emulator or physical device.

---
*Built with Jetpack Compose & Google Gemini*
