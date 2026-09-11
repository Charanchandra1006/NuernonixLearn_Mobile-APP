package com.example.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface StudentDao {
    @Query("SELECT * FROM students WHERE studentId = :studentId")
    fun getStudent(studentId: String): Flow<StudentEntity?>

    @Query("SELECT * FROM students")
    fun getAllStudents(): Flow<List<StudentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudent(student: StudentEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStudents(students: List<StudentEntity>)
}

@Dao
interface SubjectDao {
    @Query("SELECT * FROM subjects")
    fun getAllSubjects(): Flow<List<SubjectEntity>>

    @Query("SELECT * FROM subjects WHERE id = :id")
    fun getSubject(id: String): Flow<SubjectEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSubjects(subjects: List<SubjectEntity>)

    @Update
    suspend fun updateSubject(subject: SubjectEntity)
}

@Dao
interface TopicDao {
    @Query("SELECT * FROM topics")
    fun getAllTopics(): Flow<List<TopicEntity>>

    @Query("SELECT * FROM topics WHERE subjectId = :subjectId")
    fun getTopicsForSubject(subjectId: String): Flow<List<TopicEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTopics(topics: List<TopicEntity>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTopic(topic: TopicEntity)
}

@Dao
interface AcademicRecordDao {
    @Query("SELECT * FROM academic_records WHERE studentId = :studentId ORDER BY recordedAt DESC")
    fun getRecordsForStudent(studentId: String): Flow<List<AcademicRecordEntity>>

    @Query("SELECT * FROM academic_records WHERE studentId = :studentId AND subjectId = :subjectId ORDER BY recordedAt DESC")
    fun getRecordsForSubject(studentId: String, subjectId: String): Flow<List<AcademicRecordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecord(record: AcademicRecordEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecords(records: List<AcademicRecordEntity>)
}

@Dao
interface AttendanceDao {
    @Query("SELECT * FROM attendance WHERE studentId = :studentId")
    fun getAttendanceForStudent(studentId: String): Flow<List<AttendanceEntity>>

    @Query("SELECT * FROM attendance WHERE studentId = :studentId AND subjectId = :subjectId LIMIT 1")
    fun getAttendanceForSubject(studentId: String, subjectId: String): Flow<AttendanceEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttendance(attendance: AttendanceEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAttendances(attendances: List<AttendanceEntity>)
}

@Dao
interface TopicMasteryDao {
    @Query("SELECT * FROM topic_mastery WHERE studentId = :studentId")
    fun getMasteryForStudent(studentId: String): Flow<List<TopicMasteryEntity>>

    @Query("SELECT * FROM topic_mastery WHERE studentId = :studentId AND topicId = :topicId")
    fun getMasteryForTopic(studentId: String, topicId: String): Flow<TopicMasteryEntity?>

    @Query("SELECT * FROM topic_mastery WHERE studentId = :studentId AND subjectId = :subjectId")
    fun getMasteryForSubject(studentId: String, subjectId: String): Flow<List<TopicMasteryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateMastery(mastery: TopicMasteryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAllMastery(masteryList: List<TopicMasteryEntity>)
}

@Dao
interface PredictionDao {
    @Query("SELECT * FROM predictions WHERE studentId = :studentId AND subjectId = :subjectId ORDER BY generatedAt DESC LIMIT 1")
    fun getLatestPrediction(studentId: String, subjectId: String): Flow<PredictionEntity?>

    @Query("SELECT * FROM predictions WHERE studentId = :studentId ORDER BY generatedAt DESC")
    fun getAllPredictionsForStudent(studentId: String): Flow<List<PredictionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPrediction(prediction: PredictionEntity): Long

    @Query("UPDATE predictions SET isFlagged = 1, flagReason = :reason WHERE id = :id")
    suspend fun flagPrediction(id: Long, reason: String)
}

@Dao
interface RiskScoreDao {
    @Query("SELECT * FROM risk_scores WHERE studentId = :studentId ORDER BY generatedAt DESC LIMIT 1")
    fun getLatestRiskScore(studentId: String): Flow<RiskScoreEntity?>

    @Query("SELECT * FROM risk_scores WHERE studentId = :studentId ORDER BY generatedAt DESC")
    fun getRiskScoresForStudent(studentId: String): Flow<List<RiskScoreEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRiskScore(riskScore: RiskScoreEntity): Long
}

@Dao
interface LearningPlanDao {
    @Query("SELECT * FROM learning_plans WHERE studentId = :studentId AND status = 'active' ORDER BY generatedAt DESC LIMIT 1")
    fun getActivePlan(studentId: String): Flow<LearningPlanEntity?>

    @Query("SELECT * FROM learning_plan_items WHERE planId = :planId ORDER BY priorityRank ASC")
    fun getPlanItems(planId: Long): Flow<List<LearningPlanItemEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlan(plan: LearningPlanEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlanItems(items: List<LearningPlanItemEntity>)

    @Query("UPDATE learning_plan_items SET status = :status WHERE id = :itemId")
    suspend fun updateItemStatus(itemId: Long, status: String)

    @Query("UPDATE learning_plans SET status = 'superseded' WHERE studentId = :studentId")
    suspend fun supersedeOlderPlans(studentId: String)
}

@Dao
interface InterventionLogDao {
    @Query("SELECT * FROM intervention_logs WHERE studentId = :studentId ORDER BY loggedAt DESC")
    fun getInterventionsForStudent(studentId: String): Flow<List<InterventionLogEntity>>

    @Query("SELECT * FROM intervention_logs ORDER BY loggedAt DESC")
    fun getAllInterventions(): Flow<List<InterventionLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertIntervention(log: InterventionLogEntity): Long
}

@Dao
interface NotificationDao {
    @Query("SELECT * FROM notifications WHERE studentId = :studentId ORDER BY sentAt DESC")
    fun getNotificationsForStudent(studentId: String): Flow<List<NotificationEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotification(notification: NotificationEntity)

    @Query("UPDATE notifications SET isRead = 1 WHERE id = :id")
    suspend fun markAsRead(id: Long)
}
