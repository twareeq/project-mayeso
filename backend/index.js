const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/v1/auth', require('./src/modules/auth/routes'));
app.use('/api/v1/users', require('./src/modules/users/routes'));
app.use('/api/v1/schools', require('./src/modules/schools/routes'));
app.use('/api/v1/sections', require('./src/modules/sections/routes'));
app.use('/api/v1/classes', require('./src/modules/classes/routes'));
app.use('/api/v1/subjects', require('./src/modules/subjects/routes'));
app.use('/api/v1/teacher-assignments', require('./src/modules/teacherAssignments/routes'));
app.use('/api/v1/system-config', require('./src/modules/systemConfig/routes'));
app.use('/api/v1/exams', require('./src/modules/exams/routes'));
app.use('/api/v1/students', require('./src/modules/students/routes'));
app.use('/api/v1/marks', require('./src/modules/marks/routes'));
app.use('/api/v1/attendance', require('./src/modules/attendance/routes'));
app.use('/api/v1/lesson-plans', require('./src/modules/lessonPlans/routes'));
app.use('/api/v1/analytics', require('./src/modules/analytics/routes'));
app.use('/api/v1/reports', require('./src/modules/reports/routes'));

const { errorHandler } = require('./src/middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
