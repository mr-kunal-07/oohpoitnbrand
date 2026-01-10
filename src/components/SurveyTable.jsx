"use client";
import React from 'react'
import { NotebookTabs } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import {
  FiChevronDown, FiChevronUp, FiUser, FiBarChart2, FiPieChart,
  FiClock, FiUsers, FiAward, FiTrendingUp, FiDownload, FiSearch,
  FiX, FiCheckCircle, FiAlertCircle
} from "react-icons/fi";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
const SENTIMENT_COLORS = { positive: '#10B981', neutral: '#F59E0B', negative: '#EF4444' };

const formatTime = (totalSeconds) => {
  if (!totalSeconds || totalSeconds === 0) return "0s";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds}s`;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white px-4 py-2 rounded-lg shadow-xl border border-slate-200">
      <p className="text-sm font-semibold text-slate-900">{payload[0].name}</p>
      <p className="text-sm text-slate-600">{payload[0].value}%</p>
      {payload[0].payload.count && (
        <p className="text-xs text-slate-500">{payload[0].payload.count} responses</p>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color = "blue", subtitle }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-xl bg-${color}-50 border border-${color}-200`}>
        <Icon className={`text-${color}-600 w-5 h-5`} />
      </div>
    </div>
    <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
    <p className="text-sm text-slate-600 font-medium">{label}</p>
    {subtitle && <p className="text-xs text-slate-500 mt-1 truncate" title={subtitle}>{subtitle}</p>}
  </div>
);

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-12 px-4">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 border border-slate-200 mb-4">
      <Icon className="text-slate-400" size={32} />
    </div>
    <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 max-w-md mx-auto">{description}</p>
  </div>
);

export default function SurveyTable({ surveyData = [], users = [], campaignId }) {
  const [expandedRows, setExpandedRows] = useState({});
  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [showOverallInsightsModal, setShowOverallInsightsModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleRowExpansion = useCallback((index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const surveyRespondents = useMemo(() => {
    if (!users?.length || !surveyData?.length) return {};

    const respondentsMap = {};
    surveyData.forEach((survey, idx) => {
      respondentsMap[idx] = users.filter(u =>
        u.survey?.some(s =>
          s.campaignId === campaignId &&
          s.question === survey.question
        )
      );
    });
    return respondentsMap;
  }, [users, surveyData, campaignId]);

  const getInsightsData = useCallback((survey) => {
    const totalResponses = survey.options.reduce((acc, curr) => acc + curr, 0);
    return survey.question_options.map((option, i) => ({
      name: option,
      value: totalResponses > 0 ? Math.round((survey.options[i] / totalResponses) * 100) : 0,
      count: survey.options[i],
    }));
  }, []);

  const overallInsights = useMemo(() => {
    if (!users?.length || !campaignId || !surveyData?.length) return {};

    const surveyResponses = users.flatMap(user =>
      (user.survey || [])
        .filter(s => s.campaignId === campaignId)
        .map(s => ({
          ...s,
          userId: user.id,
          userName: user.name,
          userGender: user.gender,
          userAge: user.age,
          timeSpent: s.timeSpent || 0
        }))
    );

    if (!surveyResponses.length) return {};

    const totalParticipants = new Set(surveyResponses.map(s => s.userId)).size;
    const validTimeSpent = surveyResponses.filter(s => s.timeSpent > 0);
    const totalTimeSpent = validTimeSpent.reduce((sum, s) => sum + s.timeSpent, 0);
    const avgTimePerResponse = validTimeSpent.length > 0 ? totalTimeSpent / validTimeSpent.length : 0;

    const timeByQuestion = surveyData
      .map((sq, idx) => {
        const times = surveyResponses
          .filter(r => r.question === sq.question && r.timeSpent > 0)
          .map(r => r.timeSpent);
        return {
          question: `Q${idx + 1}`,
          fullQuestion: sq.question,
          avgTime: times.length ? Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 10) / 10 : 0,
          responseCount: times.length
        };
      })
      .filter(q => q.avgTime > 0);

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

    const totalChoices = Object.values(allChoices).reduce((s, v) => s + v, 0);
    const topChoices = Object.entries(allChoices)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([choice, count]) => ({
        name: choice.length > 40 ? choice.substring(0, 40) + '...' : choice,
        fullName: choice,
        value: count,
        percentage: Math.round((count / totalChoices) * 100)
      }));

    const positiveKw = ['yes', 'recommend', 'like', 'good', 'excellent', 'love', 'great', 'awesome', 'definitely', 'satisfied', 'agree'];
    const neutralKw = ['maybe', 'neutral', 'okay', 'ok', 'perhaps', 'average', 'somewhat'];
    const negativeKw = ['no', 'dislike', 'bad', 'terrible', 'hate', 'never', 'awful', 'disappointed', 'disagree'];

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
      { name: 'Positive', value: Math.round((positive / totalSentiment) * 100), count: positive, emoji: '👍', color: SENTIMENT_COLORS.positive },
      { name: 'Neutral', value: Math.round((neutral / totalSentiment) * 100), count: neutral, emoji: '😐', color: SENTIMENT_COLORS.neutral },
      { name: 'Negative', value: Math.round((negative / totalSentiment) * 100), count: negative, emoji: '👎', color: SENTIMENT_COLORS.negative }
    ].filter(i => i.count > 0) : [];

    return {
      engagement: {
        totalParticipants,
        totalTimeSpent: Math.round(totalTimeSpent),
        avgTimePerResponse: Math.round(avgTimePerResponse * 10) / 10,
        timeByQuestion
      },
      awareness: {
        percentage: Math.round(awarenessPercentage * 10) / 10,
        data: awarenessData,
        totalCorrect: correctAnswers,
        totalAnswers
      },
      preferences: { topChoices },
      sentiment: { data: sentimentData, totalSentimentResponses: totalSentiment }
    };
  }, [users, surveyData, campaignId]);

  const handleViewInsights = useCallback((survey, index) => {
    const insights = getInsightsData(survey);
    setSelectedSurvey({ ...survey, index, insights });
    setShowInsightsModal(true);
  }, [getInsightsData]);

  const exportSurveyData = useCallback(() => {
    const csvRows = [['Question', 'Option', 'Responses', 'Percentage']];

    surveyData.forEach(survey => {
      const total = survey.options.reduce((acc, curr) => acc + curr, 0);
      survey.question_options.forEach((option, idx) => {
        const count = survey.options[idx];
        const percentage = total > 0 ? ((count / total) * 100).toFixed(2) : 0;
        csvRows.push([
          `"${survey.question}"`,
          `"${option}"`,
          count,
          `${percentage}%`
        ]);
      });
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [surveyData]);

  const getFilteredRespondents = useCallback((respondents) => {
    if (!searchTerm) return respondents;
    return respondents.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const InsightsModal = () => {
    if (!selectedSurvey || !showInsightsModal) return null;

    const totalResponses = selectedSurvey.options.reduce((acc, curr) => acc + curr, 0);

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 border border-purple-200 rounded-xl">
                  <FiBarChart2 className="text-purple-600" size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Question Insights</h2>
                  <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">
                    {selectedSurvey.question}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInsightsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FiX className="text-slate-600" size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedSurvey.insights?.length || totalResponses === 0 ? (
              <EmptyState
                icon={FiBarChart2}
                title="No Data Available"
                description="Insights will appear once users respond to this question."
              />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    icon={FiUsers}
                    label="Total Responses"
                    value={totalResponses}
                    color="blue"
                  />
                  <StatCard
                    icon={FiCheckCircle}
                    label="Most Popular"
                    value={Math.max(...selectedSurvey.options)}
                    color="green"
                    subtitle={selectedSurvey.question_options[selectedSurvey.options.indexOf(Math.max(...selectedSurvey.options))]}
                  />
                </div>

                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={selectedSurvey.insights}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name.substring(0, 20)}: ${value}%`}
                        outerRadius={110}
                        dataKey="value"
                      >
                        {selectedSurvey.insights.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Option</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Responses</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {selectedSurvey.insights.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-900">{item.name}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.count}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[100px]">
                                  <div
                                    className="h-2 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${item.value}%`,
                                      backgroundColor: COLORS[idx % COLORS.length]
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium text-slate-900 min-w-[45px]">
                                  {item.value}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-purple-50 font-semibold border-t-2 border-purple-200">
                          <td className="px-4 py-3 text-sm text-slate-900">Total</td>
                          <td className="px-4 py-3 text-sm text-slate-900">
                            {selectedSurvey.insights.reduce((sum, i) => sum + i.count, 0)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900">100%</td>
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

  const OverallInsightsModal = () => {
    if (!showOverallInsightsModal) return null;

    const { engagement, awareness, preferences, sentiment } = overallInsights;
    const hasData = engagement?.totalParticipants > 0;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 border border-purple-200 rounded-xl">
                  <FiPieChart size={24} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Survey Analytics Dashboard</h2>
                  <p className="text-sm text-slate-600 mt-0.5">Comprehensive campaign insights</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportSurveyData}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm text-slate-700"
                >
                  <FiDownload size={16} />
                  Export
                </button>
                <button
                  onClick={() => setShowOverallInsightsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <FiX className="text-slate-600" size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!hasData ? (
              <EmptyState
                icon={FiPieChart}
                title="No Survey Data Yet"
                description="Survey insights will appear here once users start participating in your campaign."
              />
            ) : (
              <div className="space-y-6">
                {engagement && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                      <FiUsers className="text-blue-600" size={22} />
                      <h3 className="text-lg font-semibold text-slate-900">Engagement Overview</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <StatCard
                        icon={FiUsers}
                        label="Total Participants"
                        value={engagement.totalParticipants}
                        color="blue"
                      />
                      <StatCard
                        icon={FiClock}
                        label="Total Time Spent"
                        value={formatTime(engagement.totalTimeSpent)}
                        color="green"
                      />
                      <StatCard
                        icon={FiClock}
                        label="Avg Time/Response"
                        value={formatTime(engagement.avgTimePerResponse)}
                        color="purple"
                      />
                    </div>

                    {engagement.timeByQuestion?.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                          <FiClock className="text-purple-600" size={18} />
                          Average Time per Question
                        </h4>
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={engagement.timeByQuestion}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                            <XAxis
                              dataKey="question"
                              tick={{ fontSize: 12, fill: '#64748B' }}
                            />
                            <YAxis
                              tick={{ fontSize: 12, fill: '#64748B' }}
                              label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: '#64748B' }}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (!active || !payload?.[0]) return null;
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white px-4 py-2 rounded-lg shadow-xl border border-slate-200">
                                    <p className="text-xs font-semibold text-slate-900 mb-1">
                                      {data.fullQuestion}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      {formatTime(data.avgTime)}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      {data.responseCount} responses
                                    </p>
                                  </div>
                                );
                              }}
                            />
                            <Bar dataKey="avgTime" fill="#6366F1" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                )}

                {awareness?.data?.length > 0 && awareness.totalAnswers > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                      <FiAward className="text-green-600" size={22} />
                      <h3 className="text-lg font-semibold text-slate-900">Quiz Performance</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
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

                      <div className="flex flex-col justify-center gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                          <div className="text-5xl font-bold text-green-600 mb-2">
                            {awareness.percentage}%
                          </div>
                          <div className="text-base text-slate-700 font-medium mb-3">
                            Accuracy Rate
                          </div>
                          <div className="text-sm text-slate-600">
                            {awareness.totalCorrect} correct out of {awareness.totalAnswers} total answers
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                            <FiCheckCircle className="text-green-600 mx-auto mb-2" size={24} />
                            <div className="text-2xl font-bold text-slate-900">{awareness.totalCorrect}</div>
                            <div className="text-xs text-slate-600">Correct</div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center">
                            <FiAlertCircle className="text-red-600 mx-auto mb-2" size={24} />
                            <div className="text-2xl font-bold text-slate-900">
                              {awareness.totalAnswers - awareness.totalCorrect}
                            </div>
                            <div className="text-xs text-slate-600">Incorrect</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {preferences?.topChoices?.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                      <FiTrendingUp className="text-orange-600" size={22} />
                      <h3 className="text-lg font-semibold text-slate-900">Top Preferences</h3>
                    </div>

                    <div className="space-y-3">
                      {preferences.topChoices.map((choice, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-orange-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 border border-orange-200 text-orange-600 font-bold text-sm">
                              {idx + 1}
                            </div>
                            <span className="font-medium text-slate-900" title={choice.fullName}>{choice.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-600">{choice.value} responses</span>
                            <span className="px-3 py-1.5 bg-orange-100 border border-orange-200 text-orange-600 rounded-lg font-semibold text-sm">
                              {choice.percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {sentiment?.data?.length > 0 && sentiment.totalSentimentResponses > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-2xl">💭</span>
                      <h3 className="text-lg font-semibold text-slate-900">Sentiment Analysis</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
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
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-3">
                        {sentiment.data.map((item) => (
                          <div key={item.name} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-3xl">{item.emoji}</span>
                                <div>
                                  <div className="font-semibold text-slate-900">{item.name}</div>
                                  <div className="text-sm text-slate-600">{item.count} responses</div>
                                </div>
                              </div>
                              <div className="text-3xl font-bold" style={{ color: item.color }}>
                                {item.value}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3">
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
    <div className="bg-white rounded-xl w-full my-6 shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 flex gap-2 items-center"><NotebookTabs className="h-8 w-8 text-purple-600" />Survey Details</h2>
        </div>
        <button
          onClick={() => setShowOverallInsightsModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium shadow-sm transition-colors"
        >
          <FiPieChart size={18} />
          <span>View Analytics</span>
        </button>
      </div>

      <div className="overflow-x-auto rounded-b-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Question</th>
              <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Options</th>
              <th className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Responses</th>
              <th className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {surveyData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12">
                  <EmptyState icon={FiBarChart2} title="No Survey Questions" description="Add survey questions to start collecting responses." />
                </td>
              </tr>
            ) : (
              surveyData.map((survey, index) => {
                const respondents = surveyRespondents[index] || [];
                const filteredRespondents = getFilteredRespondents(respondents);

                return (
                  <React.Fragment key={survey.id ?? index}>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 border border-blue-200 text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 line-clamp-2" title={survey.question}>
                              {survey.question}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {survey.question_options.slice(0, 3).map((option, optIdx) => (
                            <span
                              key={optIdx}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              <span className="max-w-[100px] truncate">{option}</span>
                              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-xs">
                                {survey.options[optIdx]}
                              </span>
                            </span>
                          ))}
                          {survey.question_options.length > 3 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200">
                              +{survey.question_options.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm bg-green-50 text-green-700 font-semibold border border-green-200">
                          <FiUsers size={14} />
                          {survey.options.reduce((acc, curr) => acc + curr, 0)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewInsights(survey, index)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-purple-700 hover:text-purple-800 hover:bg-purple-50 border border-purple-200 rounded-lg transition-colors"
                            title="View Insights"
                          >
                            <FiBarChart2 size={16} />
                            <span>Insights</span>
                          </button>
                          <button
                            onClick={() => toggleRowExpansion(index)}
                            className="p-2 text-blue-700 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                            title={expandedRows[index] ? "Collapse" : "Expand"}
                          >
                            {expandedRows[index] ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedRows[index] && (
                      <tr className="bg-slate-50">
                        <td colSpan={4} className="px-4 sm:px-6 py-6">
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                              <div className="flex items-center gap-2">
                                <FiUser className="text-slate-600" size={18} />
                                <h4 className="text-sm font-semibold text-slate-900">Respondents</h4>
                                <span className="text-xs text-slate-600">
                                  ({respondents.length} users)
                                </span>
                              </div>
                              {respondents.length > 0 && (
                                <div className="relative">
                                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                  <input
                                    type="text"
                                    placeholder="Search respondents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                                  />
                                </div>
                              )}
                            </div>

                            {respondents.length === 0 ? (
                              <div className="text-center py-6 text-slate-600 bg-white border border-slate-200 rounded-lg">
                                <FiUser className="mx-auto mb-2 text-slate-400" size={24} />
                                <p className="text-sm">No responses yet for this question</p>
                              </div>
                            ) : filteredRespondents.length === 0 ? (
                              <div className="text-center py-6 text-slate-600 bg-white border border-slate-200 rounded-lg">
                                <FiSearch className="mx-auto mb-2 text-slate-400" size={24} />
                                <p className="text-sm">No respondents found matching "{searchTerm}"</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredRespondents.map((user) => {
                                  const userSurvey = user.survey.find(s => s.campaignId === campaignId && s.question === survey.question);
                                  return (
                                    <div
                                      key={user.id}
                                      className="bg-white p-4 rounded-lg border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all"
                                    >
                                      <div className="flex items-start gap-3">
                                        {user.profilePicture ? (
                                          <img
                                            src={user.profilePicture}
                                            alt={user.name}
                                            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-slate-200"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border border-purple-200 flex items-center justify-center flex-shrink-0">
                                            <FiUser className="text-purple-600" size={20} />
                                          </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                                          <p className="text-xs text-slate-600 mt-1">Selected:</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {userSurvey.selectedOption.map((optIdx, i) => (
                                              <span key={i} className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs rounded truncate max-w-full">
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <InsightsModal />
      <OverallInsightsModal />
    </div>
  );
}