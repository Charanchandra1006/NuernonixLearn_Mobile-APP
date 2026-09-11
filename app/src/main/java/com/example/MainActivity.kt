package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.example.data.local.AppDatabase
import com.example.data.remote.GeminiService
import com.example.data.repository.LearnSenseRepository
import com.example.ui.MainApp
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.viewmodel.LearnSenseViewModel

class MainActivity : ComponentActivity() {

    private lateinit var viewModel: LearnSenseViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = AppDatabase.getInstance(applicationContext)
        val repository = LearnSenseRepository(database)
        val geminiService = GeminiService()
        viewModel = LearnSenseViewModel(repository, geminiService)

        setContent {
            MyApplicationTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    MainApp(viewModel = viewModel)
                }
            }
        }
    }
}
