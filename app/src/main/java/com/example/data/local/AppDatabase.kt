package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [
        StudentEntity::class,
        SubjectEntity::class,
        TopicEntity::class,
        AcademicRecordEntity::class,
        AttendanceEntity::class,
        TopicMasteryEntity::class,
        PredictionEntity::class,
        RiskScoreEntity::class,
        LearningPlanEntity::class,
        LearningPlanItemEntity::class,
        InterventionLogEntity::class,
        NotificationEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun studentDao(): StudentDao
    abstract fun subjectDao(): SubjectDao
    abstract fun topicDao(): TopicDao
    abstract fun academicRecordDao(): AcademicRecordDao
    abstract fun attendanceDao(): AttendanceDao
    abstract fun topicMasteryDao(): TopicMasteryDao
    abstract fun predictionDao(): PredictionDao
    abstract fun riskScoreDao(): RiskScoreDao
    abstract fun learningPlanDao(): LearningPlanDao
    abstract fun interventionLogDao(): InterventionLogDao
    abstract fun notificationDao(): NotificationDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "learnsense_database.db"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
