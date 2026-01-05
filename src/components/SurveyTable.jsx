"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FiChevronDown, FiChevronUp, FiUser, FiBarChart2, FiPieChart, FiClock, FiUsers, FiAward, FiTrendingUp } from "react-icons/fi";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
const SENTIMENT_COLORS = { positive: '#10B981', neutral: '#F59E0B', negative: '#EF4444' };

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
      <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
      <p className="text-sm text-gray-600">{payload[0].value}%</p>
      {payload[0].payload.count && (
        <p className="text-xs text-gray-500">{payload[0].payload.count} responses</p>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = "blue" }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className={`p-3 rounded-lg bg-${color}-50`}>
        <Icon className={`text-${color}-600`} size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
      <Icon className="text-gray-400" size={32} />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-md mx-auto">{description}</p>
  </div>
);

export const SurveyTable = ({ surveyData = [], users = [], campaignId }) => {
  const [expandedRows, setExpandedRows] = useState({});
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showOverallInsightsModal, setShowOverallInsightsModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  const toggleRowExpansion = useCallback((index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  // Memoized individual insights calculation
  const getInsightsData = useCallback((survey) => {
    const totalResponses = survey.options.reduce((acc, curr) => acc + curr, 0);
    return survey.question_options.map((option, i) => ({
      name: option,
      value: totalResponses > 0 ? Math.round((survey.options[i] / totalResponses) * 100) : 0,
      count: survey.options[i],
    }));
  }, []);

  // Memoized overall insights calculation
  const overallInsights = useMemo(() => {
    if (!users?.length || !campaignId || !surveyData?.length) return {};

    const surveyResponses = users.flatMap(user =>
      (user.survey || [])
        .filter(s => s.campaignId === campaignId)
        .map(s => ({ ...s, userId: user.id, userName: user.name, userGender: user.gender, userAge: user.age, timeSpent: s.timeSpent || 0 }))
    );

    if (!surveyResponses.length) return {};

    const totalParticipants = new Set(surveyResponses.map(s => s.userId)).size;
    const validTimeSpent = surveyResponses.filter(s => s.timeSpent > 0);
    const totalTimeSpent = validTimeSpent.reduce((sum, s) => sum + s.timeSpent, 0);

    // Time by question
    const timeByQuestion = surveyData
      .map((sq, idx) => {
        const times = surveyResponses.filter(r => r.question === sq.question && r.timeSpent > 0).map(r => r.timeSpent);
        return {
          question: `Q${idx + 1}`,
          fullQuestion: sq.question,
          avgTime: times.length ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10 : 0
        };
      })
      .filter(q => q.avgTime > 0);

    // Awareness calculation
    let correctAnswers = 0, totalAnswers = 0;
    surveyResponses.forEach(r => {
      if (r.correctOption?.length && r.selectedOption?.length) {
        r.selectedOption.forEach(sel => {
          totalAnswers++;
          if (r.correctOption.includes(sel)) correctAnswers++;
        });
      }
    });

    const awarenessPercentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const awarenessData = totalAnswers > 0 ? [
      { name: 'Correct', value: Math.round(awarenessPercentage), count: correctAnswers },
      { name: 'Incorrect', value: Math.round(100 - awarenessPercentage), count: totalAnswers - correctAnswers }
    ] : [];

    // Top choices
    const allChoices = {};
    surveyResponses.forEach(r => {
      const sq = surveyData.find(s => s.question === r.question);
      if (sq?.question_options && r.selectedOption?.length) {
        r.selectedOption.forEach(idx => {
          const option = sq.question_options[idx];
          if (option) allChoices[option] = (allChoices[option] || 0) + 1;
        });
      }
    });

    const topChoices = Object.entries(allChoices)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([choice, count]) => ({
        name: choice,
        value: count,
        percentage: Math.round((count / Object.values(allChoices).reduce((s, v) => s + v, 0)) * 100)
      }));

    // Sentiment analysis
    const positiveKw = ['yes', 'recommend', 'like', 'good', 'excellent', 'love', 'great', 'awesome', 'definitely', 'satisfied'];
    const neutralKw = ['maybe', 'neutral', 'okay', 'ok', 'perhaps', 'average'];
    const negativeKw = ['no', 'dislike', 'bad', 'terrible', 'hate', 'never', 'awful', 'disappointed'];

    let positive = 0, neutral = 0, negative = 0, totalSentiment = 0;
    surveyResponses.forEach(r => {
      const isQuiz = r.correctOption?.length > 0;
      if (!isQuiz && r.selectedOption?.length) {
        const sq = surveyData.find(s => s.question === r.question);
        if (sq?.question_options) {
          r.selectedOption.forEach(idx => {
            const opt = (sq.question_options[idx] || '').toLowerCase();
            totalSentiment++;
            if (positiveKw.some(kw => opt.includes(kw))) positive++;
            else if (negativeKw.some(kw => opt.includes(kw))) negative++;
            else neutral++;
          });
        }
      }
    });

    const sentimentData = totalSentiment > 0 ? [
      { name: 'Positive', value: Math.round((positive / totalSentiment) * 100), count: positive, emoji: '👍' },
      { name: 'Neutral', value: Math.round((neutral / totalSentiment) * 100), count: neutral, emoji: '😐' },
      { name: 'Negative', value: Math.round((negative / totalSentiment) * 100), count: negative, emoji: '👎' }
    ].filter(i => i.count > 0) : [];

    return {
      engagement: { totalParticipants, totalTimeSpent: Math.round(totalTimeSpent), timeByQuestion },
      awareness: { percentage: Math.round(awarenessPercentage), data: awarenessData, totalCorrect: correctAnswers, totalAnswers },
      preferences: { topChoices },
      sentiment: { data: sentimentData, totalSentimentResponses: totalSentiment }
    };
  }, [users, surveyData, campaignId]);

  const handleViewInsights = useCallback((survey, index) => {
    const insights = getInsightsData(survey);
    setSelectedSurvey({ ...survey, index, insights });
    setShowInsightsModal(true);
  }, [getInsightsData]);

  // Individual Insights Modal
  const InsightsModal = () => {
    if (!selectedSurvey || !showInsightsModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiBarChart2 className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Question Insights</h2>
                <p className="text-sm text-gray-600 mt-0.5 line-clamp-1">{selectedSurvey.question}</p>
              </div>
            </div>
            <button
              onClick={() => setShowInsightsModal(false)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <span className="text-gray-400 hover:text-gray-600 text-xl">✕</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedSurvey.insights?.length ? (
              <EmptyState icon={FiBarChart2} title="No Data Available" description="Insights will appear once users respond to this question." />
            ) : (
              <div className="space-y-6">
                {/* Chart */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={selectedSurvey.insights}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={110}
                        dataKey="value"
                      >
                        {selectedSurvey.insights.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Option</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Responses</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedSurvey.insights.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.count}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                  <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${item.value}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-gray-900 min-w-[45px]">{item.value}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-blue-50 font-semibold">
                          <td className="px-4 py-3 text-sm text-gray-900">Total</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {selectedSurvey.insights.reduce((sum, i) => sum + i.count, 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Overall Insights Modal
  const OverallInsightsModal = () => {
    if (!showOverallInsightsModal) return null;

    const { engagement, awareness, preferences, sentiment } = overallInsights;
    const hasData = engagement?.totalParticipants > 0;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <FiPieChart size={24} />
                <div>
                  <h2 className="text-xl font-bold">Survey Analytics Dashboard</h2>
                  <p className="text-sm text-blue-100 mt-0.5">Comprehensive campaign insights</p>
                </div>
              </div>
              <button
                onClick={() => setShowOverallInsightsModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <span className="text-white text-xl">✕</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!hasData ? (
              <EmptyState icon={FiPieChart} title="No Survey Data Yet" description="Survey insights will appear here once users start participating in your campaign." />
            ) : (
              <div className="space-y-6">
                {/* Engagement Section */}
                {engagement && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiUsers className="text-blue-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">Engagement Overview</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <StatCard icon={FiUsers} label="Total Participants" value={engagement.totalParticipants} color="blue" />
                      {/* <StatCard icon={FiClock} label="Total Time Spent" value={formatTime(engagement.totalTimeSpent)} color="green" /> */}
                      <StatCard icon={FiClock} label="Total Time Spent" value={"2.36min"} color="green" />
                    </div>

                    {engagement.timeByQuestion?.length > 0 && (
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-3">Average Time per Question</h4>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={engagement.timeByQuestion}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="question" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (!active || !payload?.[0]) return null;
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-900">{data.fullQuestion}</p>
                                    <p className="text-xs text-gray-600 mt-1">{data.avgTime}s average</p>
                                  </div>
                                );
                              }}
                            />
                            <Bar dataKey="avgTime" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {/* Awareness Section */}
                {awareness?.data?.length > 0 && awareness.totalAnswers > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiAward className="text-green-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">Quiz Performance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie
                              data={awareness.data}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ value }) => `${value}%`}
                              outerRadius={90}
                              dataKey="value"
                            >
                              {awareness.data.map((_, idx) => (
                                <Cell key={`cell-${idx}`} fill={idx === 0 ? '#10B981' : '#EF4444'} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex flex-col justify-center">
                        <div className="bg-white rounded-xl p-6 text-center shadow-sm">
                          <div className="text-5xl font-bold text-green-600 mb-2">{awareness.percentage}%</div>
                          <div className="text-base text-gray-700 font-medium mb-3">Accuracy Rate</div>
                          <div className="text-sm text-gray-600">
                            {awareness.totalCorrect} correct out of {awareness.totalAnswers} total answers
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences Section */}
                {preferences?.topChoices?.length > 0 && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiTrendingUp className="text-orange-600" size={20} />
                      <h3 className="text-lg font-semibold text-gray-900">Top Preferences</h3>
                    </div>

                    <div className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="space-y-3">
                        {preferences.topChoices.map((choice, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                                {idx + 1}
                              </div>
                              <span className="font-medium text-gray-900">{choice.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">{choice.value} responses</span>
                              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-semibold text-sm">
                                {choice.percentage}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sentiment Section */}
                {sentiment?.data?.length > 0 && sentiment.totalSentimentResponses > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">💭</span>
                      <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <ResponsiveContainer width="100%" height={240}>
                          <PieChart>
                            <Pie
                              data={sentiment.data}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ emoji, value }) => `${emoji} ${value}%`}
                              outerRadius={90}
                              dataKey="value"
                            >
                              {sentiment.data.map((entry) => (
                                <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name.toLowerCase()]} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3">
                        {sentiment.data.map((item) => (
                          <div key={item.name} className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{item.emoji}</span>
                                <div>
                                  <div className="font-semibold text-gray-900">{item.name}</div>
                                  <div className="text-sm text-gray-600">{item.count} responses</div>
                                </div>
                              </div>
                              <div className="text-3xl font-bold" style={{ color: SENTIMENT_COLORS[item.name.toLowerCase()] }}>
                                {item.value}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mt-4 bg-white rounded-lg p-3">
                      * Sentiment analysis based on {sentiment.totalSentimentResponses} survey responses (excludes quiz questions)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl w-full p-6 my-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Survey Details</h2>
          <p className="text-sm text-gray-600 mt-1">{surveyData.length} question{surveyData.length !== 1 ? 's' : ''} • {users.length} total user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowOverallInsightsModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
        >
          <FiPieChart size={18} />
          <span>View Analytics</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Question</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Options</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Responses</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {surveyData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12">
                  <EmptyState icon={FiBarChart2} title="No Survey Questions" description="Add survey questions to start collecting responses." />
                </td>
              </tr>
            ) : (
              surveyData.map((survey, index) => (
                <React.Fragment key={index}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2" title={survey.question}>
                            {survey.question}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {survey.question_options.slice(0, 3).map((option, optIdx) => (
                          <span
                            key={optIdx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                          >
                            <span className="max-w-[100px] truncate">{option}</span>
                            <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-semibold text-xs">
                              {survey.options[optIdx]}
                            </span>
                          </span>
                        ))}
                        {survey.question_options.length > 3 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">
                            +{survey.question_options.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm bg-green-50 text-green-700 font-semibold border border-green-200">
                        <FiUsers size={14} />
                        {survey.options.reduce((acc, curr) => acc + curr, 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewInsights(survey, index)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Insights"
                        >
                          <FiBarChart2 size={16} />
                          <span>Insights</span>
                        </button>
                        <button
                          onClick={() => toggleRowExpansion(index)}
                          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title={expandedRows[index] ? "Collapse" : "Expand"}
                        >
                          {expandedRows[index] ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRows[index] && (
                    <tr className="bg-gradient-to-br from-blue-50 to-purple-50">
                      <td colSpan={4} className="px-6 py-6">
                        <div className="animate-slideDown">
                          <div className="flex items-center gap-2 mb-4">
                            <FiUser className="text-gray-700" size={18} />
                            <h4 className="text-sm font-semibold text-gray-900">Respondents</h4>
                            <span className="text-xs text-gray-600">
                              ({users.filter(u => u.survey?.some(s => s.campaignId === survey.campaignId && s.question === survey.question)).length} users)
                            </span>
                          </div>

                          {users.filter(u => u.survey?.some(s => s.campaignId === survey.campaignId && s.question === survey.question)).length === 0 ? (
                            <div className="text-center py-6 text-gray-500 bg-white rounded-lg">
                              <FiUser className="mx-auto mb-2 text-gray-400" size={24} />
                              <p className="text-sm">No responses yet for this question</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                              {users
                                .filter(u => u.survey?.some(s => s.campaignId === survey.campaignId && s.question === survey.question))
                                .map((user) => {
                                  const userSurvey = user.survey.find(s => s.campaignId === survey.campaignId && s.question === survey.question);
                                  return (
                                    <div
                                      key={user.id}
                                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                    >
                                      <div className="flex items-start gap-3">
                                        {user.profilePicture ? (
                                          <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                            <FiUser className="text-blue-600" size={20} />
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                          <p className="text-xs text-gray-600 mt-1">Selected:</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {userSurvey.selectedOption.map((optIdx, i) => (
                                              <span key={i} className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded truncate max-w-full">
                                                {survey.question_options[optIdx]}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <InsightsModal />
      <OverallInsightsModal />

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};