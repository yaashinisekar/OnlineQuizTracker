import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import QuizCard from '../components/quiz/QuizCard';

describe('QuizCard Component', () => {
  const sampleQuiz = {
    id: 1,
    title: 'Spring Boot 3 Mastery',
    slug: 'spring-boot-3-mastery',
    categoryName: 'Java & Spring',
    categoryColor: '#10B981',
    difficulty: 'MEDIUM',
    durationMinutes: 20,
    passPercentage: 65.0,
    questionCount: 10,
    negativeMarking: true,
    negativeMarkingDeduction: 0.25,
    tags: ['spring', 'java'],
  };

  it('renders quiz title, category, and pass mark properly', () => {
    render(
      <BrowserRouter>
        <QuizCard quiz={sampleQuiz} />
      </BrowserRouter>
    );

    expect(screen.getByText('Spring Boot 3 Mastery')).toBeInTheDocument();
    expect(screen.getByText('Java & Spring')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('20 mins')).toBeInTheDocument();
    expect(screen.getByText('Pass: 65%')).toBeInTheDocument();
  });
});
