export const SurveyTable = ({ surveyData }) => {
  return (
    <div className="bg-white w-full h-full gap-4 md:gap-8 p-4 md:p-6 overflow-x-auto my-6">
      <div className="flex flex-col md:flex-row mb-4 md:items-center justify-between gap-4 md:gap-6">
        <h2 className="text-oohpoint-primary-2 text-2xl">Survey Details</h2>
      </div>
      <div className="space-y-4 overflow-x-auto">
        <table className="overflow-y-auto min-w-full table-auto border-collapse bg-white shadow-md rounded-md">
          <thead>
            <tr className="border-b h-16">
              <th className="px-4 py-2 text-left truncate" style={{ maxWidth: "120px" }}>
                CampaignID
              </th>
              <th className="px-4 py-2 text-left truncate" style={{ maxWidth: "200px" }}>
                Question
              </th>
              <th className="px-4 py-2 text-left truncate" style={{ maxWidth: "120px" }}>
                Option 1
              </th>
              <th className="px-4 py-2 text-left truncate" style={{ maxWidth: "120px" }}>
                Option 2
              </th>
              <th className="px-4 py-2 text-left truncate" style={{ maxWidth: "120px" }}>
                Option 3
              </th>
              <th className="px-4 py-2 text-left truncate" style={{ maxWidth: "120px" }}>
                Option 4
              </th>
            </tr>
          </thead>
          <tbody>
            {surveyData.length !== 0 ? (
              surveyData.slice(0, 5).map((survey, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 h-16">
                  <td
                    className="px-4 py-2 text-left truncate"
                    style={{ maxWidth: "120px" }}
                    title={survey.campaignId}
                  >
                    {survey.campaignId.length > 10
                      ? `${survey.campaignId.slice(0, 10)}...`
                      : survey.campaignId}
                  </td>
                  <td
                    className="px-4 py-2 text-left truncate"
                    style={{ maxWidth: "200px" }}
                    title={survey.question}
                  >
                    {survey.question.length > 10
                      ? `${survey.question.slice(0, 10)}...`
                      : survey.question}
                  </td>
                  {survey.question_options.map((option, optionIndex) => (
                    <td
                      className="px-4 py-2 text-left truncate"
                      key={optionIndex}
                      style={{ maxWidth: "120px" }}
                      title={option}
                    >
                      <div className="flex items-center space-x-2">
                        <span>
                          {option.length > 10
                            ? `${option.slice(0, 10)}...`
                            : option}
                        </span>
                        <span className="w-6 h-6 flex items-center justify-center rounded-full text-oohpoint-primary-2 bg-green-100 border border-gray-300 text-xs">
                          {survey.options[optionIndex]}
                        </span>
                      </div>
                    </td>
                  ))}
                  {/* Add empty cells if there are fewer options */}
                  {new Array(4 - survey.question_options.length)
                    .fill(null)
                    .map((_, emptyIndex) => (
                      <td className="px-4 py-2" key={`empty-${emptyIndex}`}>
                        &nbsp;
                      </td>
                    ))}
                </tr>
              ))
            ) : (
              <tr className={'h-20 text-2xl'}>
                <td colSpan={6} className="text-center py-4 text-oohpoint-primary-2">
                  No Survey Data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};