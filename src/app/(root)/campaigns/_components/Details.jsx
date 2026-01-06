import { useEffect, useState } from "react";
import {
  MdMoney,
  MdOutlineFormatTextdirectionRToL,
  MdQrCodeScanner,
} from "react-icons/md";
import { IoMdQrScanner } from "react-icons/io";
import dynamic from "next/dynamic";
import PieChartNew from "@/components/PieChartNew";
import { X } from "lucide-react";
import SprukoCard from "@/components/Spruko/SprukoCard";
import { AiOutlineStock } from "react-icons/ai";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Rectangle,
} from "recharts";
import Modal from "@/components/Modal";

const MapLocation = dynamic(() => import("@/components/MapLocation"), {
  ssr: false, // This will disable server-side rendering for the map
});

const CampaignDetail = ({ data }) => {
  const [open, setOpen] = useState(false);

  // Data for the bar chart (distribution of scans per month - example)
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const [monthlyScans, setMonthlyScans] = useState([]);
  const [hourlyScansData, setHourlyScansData] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (data) {
      const scans = data.ipAddress;
      if (scans) {
        const monthlyScans = scans?.reduce((acc, scan) => {
          const month = new Date(scan.createdAt).getMonth();
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        const scansData = Object.keys(monthlyScans).map((monthIndex) => ({
          name: monthNames[monthIndex], // Use the month name from `monthNames` array
          value: monthlyScans[monthIndex] || 0, // Use the number of scans or 0 if none
        }));
        setMonthlyScans(scansData);

        const hourlyScans = scans?.reduce((acc, scan) => {
          const hour = new Date(scan.createdAt).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {});
        const hourlyScansData = Object.keys(hourlyScans).map((hour) => ({
          name: `${hour}:00`, // Use the hour in HH:00 format
          value: hourlyScans[hour] || 0, // Use the number of scans or 0 if none
        }));
        setHourlyScansData(hourlyScansData);
      }
      if (data.location) {
        setLocations(data.location);
      }
    }
  }, [data]);

  return (
    <>
      <div className="flex justify-center items-center">
        <button
          type="button"
          className="bg-purple-700 text-white font-semibold text-sm px-4 py-2 rounded-md w-fit"
          onClick={() => setOpen(true)}
        >
          Insights
        </button>
      </div>
      <Modal
        className="bg-oohpoint-grey-200 grid grid-cols-1 md:grid-cols-4 gap-4 p-4 md:gap-6 md:p-6 rounded-lg h-full overflow-y-auto"
        open={open}
        close={() => setOpen(false)}
      >
        {/* Campaign Overview Cards */}
        <SprukoCard
          title="Total Engagements"
          value={`${data.ipAddress?.length}`}
          increase={`+${data.ipAddress?.length}`}
          color="text-green-500"
          iconColor="text-purple-500"
          Icon={MdQrCodeScanner}
          bgColor="bg-purple-100"
          lineColor="purple"
          lineData={hourlyScansData}
        />
        <SprukoCard
          title="Unique Engagements"
          value={`${data.locationIp?.length || 0}`}
          increase={`+${data.locationIp?.length}`}
          color="text-green-500"
          iconColor="text-green-500"
          Icon={IoMdQrScanner}
          bgColor="bg-green-100"
          lineColor="green"
          lineData={hourlyScansData}
        />
        <SprukoCard
          title="Total Redirects"
          value={`${data.redirects || 0}`}
          increase={`+${data.redirects || 0}`}
          color="text-green-500"
          iconColor="text-red-500"
          Icon={MdOutlineFormatTextdirectionRToL}
          bgColor="bg-red-100"
          lineColor="red"
          lineData={hourlyScansData}
        />
        <SprukoCard
          title="Total Investment"
          value={`Rs.${data.campaignBudget}`}
          // increase={`+${campaignsData.increase}`}
          color="text-green-500"
          iconColor="text-blue-500"
          Icon={MdMoney}
          bgColor="bg-blue-100"
          lineColor="blue"
          lineData={hourlyScansData}
        />
        <GradientBarChart
          head="Distribution of Scans"
          count={`+${data.ipAddress?.length || 0}`}
          Icon={true}
          data={monthlyScans}
          darkColor="#B77DC4"
          lightColor="#F7D5FF"
        />
        <CampaignCompletionCircle
          completedPercentage={(data.locationIp?.length / data.moq) * 100 || 0}
        />
        <SimpleLineChart
          head="Hourly Distribution of Scans"
          count={`+${data.ipAddress?.length || 0}`}
          Icon={true}
          data={hourlyScansData}
        />
        {locations.length > 0 && <MapLocation locations={locations} />}
        <div className="col-span-full">
          <h2 className="text-2xl w-full text-oohpoint-primary-2 p-4">
            State-wise distribution
          </h2>
          <div className="flex justify-center items-center gap-8 flex-col bg-white rounded-lg w-full p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 w-full">
              <div className="md:w-1/2 h-full mx-auto rounded-lg border border-oohpoint-grey-300 bg-oohpoint-grey-200 text-oohpoint-grey-500">
                {data.cities && (
                  <table className="w-full">
                    <thead>
                      <tr className=" border-b border-primary p-4">
                        <th className=" p-4 text-start">States</th>
                        <th className=" p-4 text-start">Scans</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Object.entries(data.cities).map(([key, value], i) => (
                        <tr className={`p-4`}>
                          <td className=" p-4 text-start">{key}</td>
                          <td className=" p-4 text-start">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="md:w-1/2 h-full mx-auto bg-white flex md:p-4 rounded-xl justify-center items-center overflow-x-auto w-full">
                {data.cities && <PieChartNew data={data.cities} />}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

const SimpleLineChart = ({ head, Icon, data }) => (
  <div className="md:col-span-2 bg-white rounded-lg flex flex-col justify-between items-center p-6">
    <div className="flex justify-between items-start w-full">
      <div className="flex flex-col justify-start items-start gap-2">
        <h4 className="text-oohpoint-primary-2 font-medium">{head}</h4>
      </div>
      {Icon ? (
        <AiOutlineStock className="text-3xl text-blue-500" />
      ) : (
        <AiOutlineStock className="text-3xl text-red-500" />
      )}
    </div>
    <ResponsiveContainer width="100%" height={190}>
      <LineChart data={data} margin={{ left: -20, right: 20 }}>
        {/* Define a gradient for the line */}
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#CABAE4" />
            <stop offset="100%" stopColor="#9B43AF" />
          </linearGradient>
        </defs>

        {/* Only horizontal grid lines */}
        <CartesianGrid strokeDasharray="1 1" vertical={false} />

        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

        {/* Use gradient for the line stroke */}
        <Line
          type="basis"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={4}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const GradientBarChart = ({
  lightColor,
  darkColor,
  head,
  count,
  Icon,
  data,
}) => {
  // Generate a unique id for each chart's gradient
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="bg-white rounded-lg flex flex-col justify-center items-center p-6">
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col justify-start items-start gap-2 pb-2">
          <h4 className="text-oohpoint-primary-2 font-medium">{head}</h4>
          <p className="text-oohpoint-primary-3 text-3xl font-bold">{count}</p>
        </div>
        {Icon ? (
          <AiOutlineStock className="text-3xl text-yellow-500" />
        ) : (
          <AiOutlineStock className="text-3xl text-red-500" />
        )}
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={darkColor} stopOpacity={1} />
              <stop offset="95%" stopColor={lightColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <Tooltip />
          <XAxis dataKey="name" hide={true} />
          <Bar
            dataKey="value"
            fill="#facc15"
            barSize={20}
            background={<Rectangle fill="#F2F0F5" radius={[10, 10, 10, 10]} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CampaignCompletionCircle = ({ completedPercentage }) => {
  const validCompletedPercentage = Math.min(
    100,
    Math.max(0, completedPercentage)
  ); // Ensure percentage is between 0-100

  return (
    <div className="flex justify-center items-center p-4 bg-white rounded-lg h-full">
      <div className="relative">
        {/* Circle background */}
        <svg className="w-40 h-40">
          <circle
            cx="50%"
            cy="50%"
            r="60"
            strokeWidth="15"
            className="stroke-gray-200 fill-none"
          />
          {/* Dynamic circle progress */}
          <circle
            cx="50%"
            cy="50%"
            r="60"
            strokeWidth="15"
            className="stroke-oohpoint-tertiary-1 fill-none transition-all duration-500"
            strokeDasharray="377"
            strokeDashoffset={377 - (377 * validCompletedPercentage) / 100}
            strokeLinecap="square"
          />
        </svg>
        {/* Percentage in the center */}
        <div className="absolute top-[-0.8rem] left-[0.2rem] w-full h-full flex justify-center items-center">
          <span className="text-2xl font-bold text-center my-auto">
            {validCompletedPercentage.toFixed(1)}%
          </span>
        </div>
        <h3 className=" text-center font-semibold text-oohpoint-primary-2 text-lg">
          Completion
        </h3>
      </div>
    </div>
  );
};

export default CampaignDetail;
