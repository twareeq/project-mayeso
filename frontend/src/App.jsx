import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleGuard from './components/shared/RoleGuard';
import PageWrapper from './components/layout/PageWrapper';

// Auth & Core
import Login from './pages/auth/Login';
import { useAuth } from './context/AuthContext';

// Dashboards
import TeacherDashboard from './pages/teacher/Dashboard';
import HeadTeacherDashboard from './pages/headTeacher/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

// Students
import StudentList from './pages/students/StudentList';
import StudentForm from './pages/students/StudentForm';
import StudentProfile from './pages/students/StudentProfile';

// Marks
import MarksEntry from './pages/marks/MarksEntry';
import MarksHistory from './pages/marks/MarksHistory';
import StudentResult from './pages/marks/StudentResult';
import ClassResults from './pages/marks/ClassResults';

// Attendance
import AttendanceMarking from './pages/attendance/AttendanceMarking';
import AttendanceSummary from './pages/attendance/AttendanceSummary';

// Lesson Plans
import LessonPlanList from './pages/lessonPlans/LessonPlanList';
import LessonPlanForm from './pages/lessonPlans/LessonPlanForm';
import LessonPlanDetail from './pages/lessonPlans/LessonPlanDetail';

// Analytics & Reports
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import SchoolList from './pages/schools/SchoolList';
import SchoolDetail from './pages/schools/SchoolDetail';
import ZoneList from './pages/zones/ZoneList';
import ZoneDetail from './pages/zones/ZoneDetail';

// Admin & Setup
import UserManagement from './pages/admin/UserManagement';
import SystemConfig from './pages/admin/SystemConfig';
import SchoolSetup from './pages/headTeacher/setup/Setup';

const Unauthorized = () => <div className="p-10 text-red-500 font-bold text-center bg-slate-900 m-10 rounded-2xl border border-slate-800 shadow-2xl">Unauthorized Access - You do not have permission to view this page.</div>;

// Role-based Home Redirect
const HomeRedirect = () => {
  const { role } = useAuth();
  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'head_teacher') return <Navigate to="/head-teacher" replace />;
  if (role === 'section_head' || role === 'teacher') return <Navigate to="/teacher" replace />;
  if (role === 'zone_manager' || role === 'district_officer') return <Navigate to="/analytics" replace />; 
  return <Navigate to="/unauthorized" replace />; 
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/" element={
            <RoleGuard>
              <PageWrapper>
                <HomeRedirect />
              </PageWrapper>
            </RoleGuard>
          } />

          {/* Dashboards */}
          <Route path="/teacher" element={<RoleGuard allowedRoles={['teacher', 'section_head', 'admin']}><PageWrapper><TeacherDashboard /></PageWrapper></RoleGuard>} />
          <Route path="/head-teacher" element={<RoleGuard allowedRoles={['head_teacher', 'admin']}><PageWrapper><HeadTeacherDashboard /></PageWrapper></RoleGuard>} />
          <Route path="/admin" element={<RoleGuard allowedRoles={['admin']}><PageWrapper><AdminDashboard /></PageWrapper></RoleGuard>} />

          {/* Student Management */}
          <Route path="/students" element={<RoleGuard><PageWrapper><StudentList /></PageWrapper></RoleGuard>} />
          <Route path="/students/new" element={<RoleGuard><PageWrapper><StudentForm /></PageWrapper></RoleGuard>} />
          <Route path="/students/:id" element={<RoleGuard><PageWrapper><StudentProfile /></PageWrapper></RoleGuard>} />
          <Route path="/students/:id/edit" element={<RoleGuard><PageWrapper><StudentForm /></PageWrapper></RoleGuard>} />

          {/* Marks & Assessments */}
          <Route path="/marks" element={<RoleGuard><PageWrapper><MarksEntry /></PageWrapper></RoleGuard>} />
          <Route path="/marks/history" element={<RoleGuard><PageWrapper><MarksHistory /></PageWrapper></RoleGuard>} />
          <Route path="/marks/class-results" element={<RoleGuard><PageWrapper><ClassResults /></PageWrapper></RoleGuard>} />
          <Route path="/students/:studentId/result" element={<RoleGuard><PageWrapper><StudentResult /></PageWrapper></RoleGuard>} />

          {/* Attendance */}
          <Route path="/attendance" element={<RoleGuard><PageWrapper><AttendanceMarking /></PageWrapper></RoleGuard>} />
          <Route path="/attendance/summary" element={<RoleGuard><PageWrapper><AttendanceSummary /></PageWrapper></RoleGuard>} />

          {/* Lesson Plans */}
          <Route path="/lesson-plans" element={<RoleGuard><PageWrapper><LessonPlanList /></PageWrapper></RoleGuard>} />
          <Route path="/lesson-plans/new" element={<RoleGuard><PageWrapper><LessonPlanForm /></PageWrapper></RoleGuard>} />
          <Route path="/lesson-plans/:id" element={<RoleGuard><PageWrapper><LessonPlanDetail /></PageWrapper></RoleGuard>} />
          <Route path="/lesson-plans/:id/edit" element={<RoleGuard><PageWrapper><LessonPlanForm /></PageWrapper></RoleGuard>} />

          {/* Analytics & Entities */}
          <Route path="/analytics" element={<RoleGuard><PageWrapper><AnalyticsPage /></PageWrapper></RoleGuard>} />
          <Route path="/schools" element={<RoleGuard allowedRoles={['zone_manager', 'district_officer', 'admin']}><PageWrapper><SchoolList /></PageWrapper></RoleGuard>} />
          <Route path="/schools/:id" element={<RoleGuard><PageWrapper><SchoolDetail /></PageWrapper></RoleGuard>} />
          <Route path="/zones" element={<RoleGuard allowedRoles={['district_officer', 'admin']}><PageWrapper><ZoneList /></PageWrapper></RoleGuard>} />
          <Route path="/zones/:id" element={<RoleGuard><PageWrapper><ZoneDetail /></PageWrapper></RoleGuard>} />

          {/* Management & Setup */}
          <Route path="/users" element={<RoleGuard allowedRoles={['admin']}><PageWrapper><UserManagement /></PageWrapper></RoleGuard>} />
          <Route path="/setup" element={<RoleGuard allowedRoles={['head_teacher', 'admin']}><PageWrapper><SchoolSetup /></PageWrapper></RoleGuard>} />
          <Route path="/system-config" element={<RoleGuard allowedRoles={['admin']}><PageWrapper><SystemConfig /></PageWrapper></RoleGuard>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
