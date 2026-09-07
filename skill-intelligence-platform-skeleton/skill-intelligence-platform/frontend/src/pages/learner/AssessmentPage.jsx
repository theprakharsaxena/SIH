import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import QuizInterface from '../../components/QuizInterface';

export default function LearnerAssessmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // QuizInterface expects selectedOfficer shape: { id, full_name, role_code, ... }
  const officerForQuiz = user ? {
    id: user.id,
    full_name: user.full_name,
    role_code: user.role_code || 'SSO',
    designation: user.designation,
    department: user.department,
  } : null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <QuizInterface
        selectedOfficer={officerForQuiz}
        onQuizCompleted={() => navigate('/dashboard')}
      />
    </div>
  );
}
