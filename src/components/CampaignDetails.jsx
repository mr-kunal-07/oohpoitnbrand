"use client";
import React, { useEffect, useState } from "react";
import {
  MdMoney,
  MdOutlineFormatTextdirectionRToL,
  MdQrCodeScanner,
} from "react-icons/md";
import { IoMdQrScanner } from "react-icons/io";
import Modal from "@/components/Modal";
import { Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Rectangle,
  AreaChart,
  Area,
} from "recharts";
import {
  GoogleMap,
  useJsApiLoader,
  HeatmapLayerF,
} from "@react-google-maps/api";
import { AiOutlineStock } from "react-icons/ai";
import SprukoCard from "./Spruko/SprukoCard";

const CampaignDetail = ({ campaign }) => {
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
  const [open, setOpen] = useState(false);
  const [areaWiseDistribution, setAreaWiseDistribution] = useState(null);

  const getAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCX0Ok8zf-FVwHOKQKvJ0__82QSLcaW1bA`
      );
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(`Error: ${data.status}`);
      }

      // Extract relevant parts
      const addressComponents = data.results[0]?.address_components || [];
      const locationDetails = {
        state: null,
        city: null,
        neighbourhood: null,
        pincode: null, // New field
      };

      addressComponents.forEach((component) => {
        if (component.types.includes("administrative_area_level_1")) {
          locationDetails.state = component.long_name;
        }
        if (component.types.includes("locality")) {
          locationDetails.city = component.long_name;
        }
        if (component.types.includes("sublocality_level_1")) {
          locationDetails.neighbourhood = component.long_name;
        }
        if (component.types.includes("postal_code")) {
          locationDetails.pincode = component.long_name;
        }
      });

      return locationDetails;
    } catch (error) {
      console.error("Error fetching location details:", error);
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      if (open) {
        const scans = campaign.ipAddress;
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

          const hourlyScansData = Object.keys(hourlyScans).map((hour) => {
            const hourInt = parseInt(hour, 10); // Convert hour string to integer
            const period = hourInt >= 12 ? "PM" : "AM";
            const formattedHour = hourInt % 12 === 0 ? 12 : hourInt % 12; // Convert to 12-hour format
            return {
              name: `${formattedHour}:00 ${period}`, // Format as HH:00 AM/PM
              value: hourlyScans[hour] || 0, // Use the number of scans or 0 if none
            };
          });

          setHourlyScansData(hourlyScansData);
        }

        if (campaign.location) {
          setLocations(campaign.location);
          const locationData = campaign.location.map((location) =>
            getAddress(location.latitude, location.longitude)
          );
          const response = await Promise.all(locationData);

          setAreaWiseDistribution((prev) => {
            return Object.values(
              response.reduce((acc, address) => {
                // Use optional chaining and fallback values to ensure all fields are accounted for
                const state = address?.state || "Unknown State";
                const city = address?.city || "Unknown City";
                const neighbourhood = address?.neighbourhood || "Unknown Area";
                const pincode = address?.pincode || "Unknown Pincode";

                const key = `${state}|${city}|${neighbourhood}|${pincode}`;
                if (!acc[key]) {
                  acc[key] = { state, city, neighbourhood, pincode, scans: 0 };
                }
                acc[key].scans += 1;
                return acc;
              }, {})
            );
          });
        } else setAreaWiseDistribution([]);
      }
    })();
  }, [campaign, open]);

  return (
    <>
      <div>
        <button
          type="button"
          className="px-4 py-1 hover:scale-95 cursor-pointer transition-all hover:rounded-tr-none hover:rounded-bl-none bg-oohpoint-primary-3 text-white rounded-md"
          onClick={() => {
            setOpen(true);
          }}
        >
          Insights
        </button>
      </div>
      <Modal
        className={
          "w-full grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-4 bg-oohpoint-grey-200 rounded-md shadow-sm overflow-y-auto p-2 md:p-6"
        }
        open={open}
        close={() => setOpen(false)}
      >
        {/* Campaign Overview Cards */}
        <SprukoCard
          title="Total Engagements"
          value={`+${campaign.ipAddress?.length || 0}`}
          increase="+0"
          color="text-green-400"
          Icon={IoMdQrScanner}
          iconColor="text-purple-500"
          bgColor="bg-purple-100"
        />
        <SprukoCard
          title="Unique Engagements"
          value={`+${campaign.locationIp?.length || 0}`}
          Icon={IoMdQrScanner}
          iconColor="text-red-500"
          increase="+0"
          color="text-green-400"
          bgColor="bg-red-100"
        />
        <SprukoCard
          title="Total Redirects"
          value={`+${campaign.redirects || 0}`}
          Icon={MdOutlineFormatTextdirectionRToL}
          iconColor="text-yellow-500"
          bgColor="bg-yellow-100"
          increase="+0"
          color="text-green-400"
        />
        <SprukoCard
          title="Total Investment"
          value={`Rs. ${campaign.campaignBudget}`}
          Icon={MdMoney}
          iconColor="text-blue-500"
          bgColor="bg-blue-100"
          increase="+0"
          color="text-green-400"
        />
        <div className="col-span-full grid grid-cols-1 md:grid-cols-5 gap-6">
          <GradientBarChart
            head="Distribution of Scans"
            count={`+${campaign.ipAddress?.length || 0}`}
            Icon={true}
            data={monthlyScans}
            darkColor="#B77DC4"
            lightColor="#F7D5FF"
          />
          <SimpleLineChart
            head="Hourly Distribution of Scans"
            count={`+${campaign.ipAddress?.length || 0}`}
            Icon={true}
            data={hourlyScansData}
          />
          <CampaignCompletionCircle
            completedPercentage={
              (campaign.locationIp?.length / campaign.targetScans) * 100 || 0
            }
          />
          <div className="bg-white rounded-md col-span-1 md:col-span-3 md:row-span-2">
            <h2 className="text-xl border-b w-full text-oohpoint-primary-2 text-left p-4">
              Area Wise Distribution
            </h2>
            <div className="h-[20rem] overflow-y-scroll">
              {areaWiseDistribution ? (
                areaWiseDistribution.length == 0 ? (
                  <div className="h-48 bg-white rounded-md flex items-center justify-center text-xl">
                    No Data Available
                  </div>
                ) : (
                  <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
                    <thead className="bg-primary text-black">
                      <tr>
                        <th className="p-4 text-start">State</th>
                        <th className="p-4 text-start">City</th>
                        <th className="p-4 text-start">Area</th>
                        <th className="p-4 text-start">Pincode</th>
                        <th className="p-4 text-start">Scans</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areaWiseDistribution.map(
                        (
                          { state, city, neighbourhood, pincode, scans },
                          index
                        ) => (
                          <tr
                            key={index}
                            className={`${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-gray-100`}
                          >
                            <td className="text-start p-4">{state}</td>
                            <td className="text-start p-4 text-oohpoint-primary-2">
                              {city}
                            </td>
                            <td className="text-start p-4">{neighbourhood}</td>
                            <td className="text-start p-4">{pincode}</td>
                            <td className="text-start p-4 text-oohpoint-primary-2">
                              {scans}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                )
              ) : (
                <div className="h-48 bg-white rounded-md flex items-center justify-center text-xl">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              )}
            </div>
          </div>
          {locations.length == 0 ? (
            <div className="bg-white md:col-span-2 md:row-span-2 rounded-md shadow-sm flex items-center justify-center text-lg">
              No Locations Data
            </div>
          ) : (
            <MapLocation locations={locations} />
          )}
        </div>
      </Modal>
    </>
  );
};

// const SprukoCard = ({ title, value, iconColor, Icon, bgColor }) => {
//   return (
//     <div className="p-6 flex items-start justify-between h-full w-full bg-white shadow-sm rounded-md">
//       <div className="flex items-start gap-8 flex-col">
//         <p className=" text-neutral-600 font-medium text-lg">{title}</p>
//         <p className="text-2xl">{value}</p>
//       </div>
//       <div className="text-right flex flex-col items-center justify-between h-full">
//         <div className={`p-4 rounded-full text-2xl ${iconColor} ${bgColor}`}>
//           <Icon />
//         </div>
//       </div>
//     </div>
//   );
// };

const SimpleLineChart = ({ head, Icon, data, count }) => (
  <div className="min-w-[18rem] bg-white rounded-md shadow-sm flex flex-col justify-between items-center px-2 md:col-span-2">
    <div className="px-5 py-4 mb-3 border-b flex justify-between items-start w-full">
      <div className="flex flex-col justify-start items-start gap-2">
        <h4 className="text-oohpoint-primary-2 font-medium">{head}</h4>
        {/* <p className="text-oohpoint-primary-3 text-3xl font-bold">{count}</p> */}
      </div>
      {/* {Icon ? (
        <AiOutlineStock className="text-3xl text-green-500" />
      ) : (
        <AiOutlineStock className="text-3xl text-red-500" />
      )} */}
    </div>
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        {/* Define a gradient for the fill area */}
        <defs>
          <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#CABAE4" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#9B43AF" stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Only horizontal grid lines */}
        <CartesianGrid strokeDasharray="1 1" vertical={false} />

        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />

        {/* Use gradient for the area fill */}
        <Area
          type="linear"
          dataKey="value"
          stroke="#9B43AF"
          strokeWidth={2}
          fill="url(#gradientFill)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const CampaignCompletionCircle = ({ completedPercentage }) => {
  const validCompletedPercentage = Math.min(
    100,
    Math.max(0, completedPercentage)
  ); // Ensure percentage is between 0-100

  return (
    <div className="col-span-1 flex justify-center items-center p-4 bg-white rounded-md shadow-sm h-full">
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
            className="stroke-[#8884d8] fill-none transition-all duration-500"
            strokeDasharray="377"
            strokeDashoffset={377 - (377 * validCompletedPercentage) / 100}
            strokeLinecap="round"
          />
        </svg>
        {/* Percentage in the center */}
        <div className="absolute top-[-0.8rem] left-[0.2rem] w-full h-full flex justify-center items-center">
          <span className="text-2xl font-bold text-center my-auto">
            {validCompletedPercentage.toFixed(1)}%
          </span>
        </div>
        <h3 className=" text-center font-semibold text-oohpoint-primary-2 text-2xl">
          Completion
        </h3>
      </div>
    </div>
  );
};

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
  const filteredData = data?.filter((item) => item !== undefined);
  data = filteredData;

  return (
    <div className="md:col-span-2 bg-white rounded-md shadow-sm flex flex-col justify-between items-center px-2">
      <div className="px-5 py-4 mb-3  flex justify-between items-start w-full border-b">
        <div className="flex flex-col justify-start items-start gap-2">
          <h4 className="text-oohpoint-primary-2 font-medium">{head}</h4>
          {/* <p className="text-oohpoint-primary-3 text-3xl font-bold">{count}</p> */}
        </div>
        {/* {Icon ? (
          <AiOutlineStock className="text-3xl text-green-500" />
        ) : (
          <AiOutlineStock className="text-3xl text-red-500" />
        )} */}
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={darkColor} stopOpacity={1} />
              <stop offset="95%" stopColor={lightColor} stopOpacity={1} />
            </linearGradient>
          </defs>
          <Tooltip />
          <XAxis dataKey="name" />
          <YAxis />
          <Bar
            dataKey="value"
            fill="#8884d8"
            barSize={12}
            radius={[10, 10, 10, 10]}
            background={<Rectangle fill="#F2F0F5" radius={[10, 10, 10, 10]} />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const MapLocation = ({ locations }) => {
  const mapStyles = {
    height: "350px",
    width: "100%",
  };
  const center = { lat: 29.945, lng: 76.818 };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCX0Ok8zf-FVwHOKQKvJ0__82QSLcaW1bA", // Replace with your API key
    libraries: ["visualization"], // Add the required visualization library here
  });

  const heatmapData = isLoaded
    ? locations
        .filter(
          (loc) =>
            loc && loc.latitude !== undefined && loc.longitude !== undefined
        )
        .map(
          (loc) => new window.google.maps.LatLng(loc.latitude, loc.longitude)
        )
    : [];

  const heatmapOptions = {
    radius: 10,
    opacity: 0.6,
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="md:col-span-2 md:row-span-2 min-w-[12rem] bg-white rounded-md shadow-sm flex max-lg:flex-col justify-center items-center px-2 lg:h-full py-2 max-h-[24rem] h-full">
      <div className="w-full rounded-md shadow-sm overflow-hidden">
        <GoogleMap mapContainerStyle={mapStyles} zoom={4} center={center}>
          {heatmapData.length > 0 && (
            <HeatmapLayerF data={heatmapData} options={heatmapOptions} />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default CampaignDetail;
