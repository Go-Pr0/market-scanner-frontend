import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import useTradeQuestions from '../../hooks/useTradeQuestions';
import './TradeSetup.css';

const INITIAL_QUESTIONS = [
  'What are the 3 most common mistakes you find yourself making?',
  'What are you currently working on to improve your trading?',
  'How often do you find yourself adjusting your plan mid-trade & if so, why?'
];

function TradeSetupPage() {
  const navigate = useNavigate();
  const { 
    questions: cachedQuestions, 
    fetchAdditionalQuestions, 
    saveAllQuestions,
    loading, 
    error, 
    initialLoading,
    clearQuestions 
  } = useTradeQuestions();

  const [step, setStep] = useState(1); // 1: initial, 2: additional
  const [initialAnswers, setInitialAnswers] = useState(Array(3).fill(''));
  const [additionalQuestions, setAdditionalQuestions] = useState([]);
  const [additionalAnswers, setAdditionalAnswers] = useState([]);

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    const answered = INITIAL_QUESTIONS.map((question, i) => ({ question, answer: initialAnswers[i] }));
    try {
      const newQuestions = await fetchAdditionalQuestions(answered);
      setAdditionalQuestions(newQuestions);
      setAdditionalAnswers(Array(newQuestions.length).fill(''));
      setStep(2);
    } catch (err) {
      // error is handled in hook
    }
  };
  
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const allQuestions = [
      ...INITIAL_QUESTIONS.map((q, i) => ({ question: q, answer: initialAnswers[i] })),
      ...additionalQuestions.map((q, i) => ({ question: q, answer: additionalAnswers[i] }))
    ];
    try {
      await saveAllQuestions(allQuestions);
      navigate('/trade-chat');
    } catch (err) {
      // error is handled in hook
    }
  };

  // Show loading while checking for existing questionnaire
  if (initialLoading) {
    return (
      <Layout className="dashboard">
        <div className="trade-setup-container">
          <div className="loading-state">
            <h1 className="page-title"><span className="text-gradient">Loading...</span></h1>
            <p>Checking your questionnaire setup...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (cachedQuestions) {
    // Already setup
    return (
      <Layout className="dashboard">
        <div className="trade-setup-container">
          <h1 className="page-title"><span className="text-gradient">Trade Planner Setup Complete</span></h1>
          <p>You have already completed the question setup.</p>
          <div className="actions">
            <Link to="/trade-chat" className="btn btn-primary">Go to Chat</Link>
            <button className="btn btn-outline" onClick={() => { clearQuestions(); setStep(1); }}>Reset Setup</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="dashboard">
      <div className="trade-setup-container">
        {step === 1 && (
          <>
            <h1 className="page-title"><span className="text-gradient">Initial Trade Questions</span></h1>
            <form className="questions-form" onSubmit={handleInitialSubmit}>
              {INITIAL_QUESTIONS.map((q, idx) => (
                <div className="question-group" key={idx}>
                  <label className="question-label">{q}</label>
                  <textarea
                    className="question-input"
                    value={initialAnswers[idx]}
                    onChange={(e) => {
                      const newAnswers = [...initialAnswers];
                      newAnswers[idx] = e.target.value;
                      setInitialAnswers(newAnswers);
                    }}
                    required
                  />
                </div>
              ))}
              {error && <div className="error-text">{error}</div>}
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Fetching next questions...' : 'Next'}
              </button>
            </form>
          </>
        )}
        {step === 2 && (
           <>
            <h1 className="page-title"><span className="text-gradient">Additional Questions</span></h1>
            <form className="questions-form" onSubmit={handleFinalSubmit}>
              {additionalQuestions.map((q, idx) => (
                <div className="question-group" key={idx}>
                  <label className="question-label">{q}</label>
                  <textarea
                    className="question-input"
                    value={additionalAnswers[idx]}
                    onChange={(e) => {
                      const newAnswers = [...additionalAnswers];
                      newAnswers[idx] = e.target.value;
                      setAdditionalAnswers(newAnswers);
                    }}
                    required
                  />
                </div>
              ))}
              {error && <div className="error-text">{error}</div>}
              <button className="btn btn-primary" type="submit">
                Submit & Start Chat
              </button>
            </form>
           </>
        )}
      </div>
    </Layout>
  );
}

export default TradeSetupPage; 