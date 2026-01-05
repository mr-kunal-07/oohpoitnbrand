import {
  FaSearch,
  FaLink,
  FaUsers,
  FaEnvelope,
  FaBullseye,
} from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";

const channelData = [
  {
    icon: <FaSearch className="text-purple-500" />,
    name: "Organic Search",
    bounceRate: "32.09%",
    targetReached: 782,
    sessions: 278,
    pagesPerSession: 2.9,
    avgSessionDuration: "0 hrs : 0 mins : 32 s",
    bgColor: "bg-purple-100",
    color: "text-purple-500",
  },
  {
    icon: <FiTrendingUp className="text-orange-500" />,
    name: "Direct",
    bounceRate: "39.38%",
    targetReached: 882,
    sessions: 782,
    pagesPerSession: 1.5,
    avgSessionDuration: "0 hrs : 2 mins : 45 s",
    bgColor: "bg-orange-100",
    color: "text-orange-500",
  },
  {
    icon: <FaLink className="text-green-500" />,
    name: "Referral",
    bounceRate: "22.67%",
    targetReached: 322,
    sessions: 622,
    pagesPerSession: 3.2,
    avgSessionDuration: "0 hrs : 38 mins : 28 s",
    bgColor: "bg-green-100",
    color: "text-green-500",
  },
  {
    icon: <FaUsers className="text-blue-500" />,
    name: "Social",
    bounceRate: "25.11%",
    targetReached: 389,
    sessions: 142,
    pagesPerSession: 1.4,
    avgSessionDuration: "0 hrs : 12 mins : 89 s",
    bgColor: "bg-blue-100",
    color: "text-blue-500",
  },
  {
    icon: <FaEnvelope className="text-yellow-500" />,
    name: "Email",
    bounceRate: "23.79%",
    targetReached: 378,
    sessions: 178,
    pagesPerSession: 1.6,
    avgSessionDuration: "0 hrs : 14 mins : 27 s",
    bgColor: "bg-yellow-100",
    color: "text-yellow-500",
  },
  {
    icon: <FaBullseye className="text-red-500" />,
    name: "Paid Search",
    bounceRate: "28.77%",
    targetReached: 488,
    sessions: 578,
    pagesPerSession: 2.5,
    avgSessionDuration: "0 hrs : 16 mins : 28 s",
    bgColor: "bg-red-100",
    color: "text-red-500",
  },
];

const SprukoTable = () => {
  return (
    <div className=" bg-white shadow rounded-lg col-span-4 xl:col-span-3">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg text-gray-700">Visitors By Channel Report</h2>
      </div>
      <div className=" overflow-x-scroll">
        <div className="flex items-center justify-between p-4 borber-b border-gray-200 rounded-lg">
          <div className="flex items-center justify-start gap-4">
            <div className="font-medium min-w-10 text-center">S.No</div>
            <div className="font-medium min-w-40 text-center">Channel</div>
            <div className="font-medium min-w-40 text-center">Bounce Rate</div>
            <div className="font-medium min-w-40 text-center">
              Target Reached
            </div>
            <div className="font-medium min-w-40 text-center">Sessions</div>
            <div className="font-medium min-w-40 text-center">
              Pages per Session
            </div>
            <div className="font-medium min-w-40 text-center">
              Avg Session Duration
            </div>
          </div>
        </div>
        {channelData.map((channel, index) => (
          <div
            key={index}
            className="flex items-center text-sm justify-start p-4 borber-b border-gray-200 gap-4"
          >
            <div className=" min-w-10 text-center">{index + 1}.</div>
            <div className="flex min-w-40 text-center items-center space-x-3">
              <div className={`text-xl p-2 rounded-full ${channel.bgColor}`}>
                {channel.icon}
              </div>
              <p className="text-sm font-medium text-gray-700">
                {channel.name}
              </p>
            </div>
            <div className=" min-w-40 text-center">{channel.bounceRate}</div>
            <div className=" min-w-40 text-center">{channel.targetReached}</div>
            <div className={`min-w-40 text-center text-xs`}>
              <span
                className={`px-2 py-1 rounded-md ${channel.color} ${channel.bgColor}`}
              >
                {channel.sessions}
              </span>
            </div>
            <div className=" min-w-40 text-center">
              {channel.pagesPerSession}
            </div>
            <div className=" min-w-40 text-center">
              {channel.avgSessionDuration}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SprukoTable;
