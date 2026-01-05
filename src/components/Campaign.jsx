"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import RevButton from "./RevButton";
import { MdVolumeMute, MdVolumeOff } from "react-icons/md";
import { IoMdVolumeHigh } from "react-icons/io";
import toast from "react-hot-toast";
import SpinWheel from "./SpinWheel";

const Campaign = () => {
  const [campaign, setCampaign] = useState({});
  const hour = new Date().getHours().toString();
  const date = new Date();
  //   const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  //   const date = today.toLocaleDateString("en-CA", options);
  const [showVideo, setShowVideo] = useState(false);
  const [showVideo1, setShowVideo1] = useState(false);
  const [showVideo2, setShowVideo2] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef();
  const [uuidNum, setUuidNum] = useState(null);
  const [thankModal, setThankModal] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const router = useRouter();
  const [spinWheel, setSpinWheel] = useState(false);
  const [vendors, setVendor] = useState([]);

  const params = useParams();
  const { id } = params;
  const campaignId = id.slice(0, 6);
  const vendorId = id.slice(7, 13);
  const [pricePerScan, setPricePerScan] = useState(0);

  // Check Whether the User is loggedIn or not
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Please login first and Scan the qr code again...");
      router.push("/login");
    }
  }, [router]);

  // Fetch Campaign
  const fetchCampaign = async () => {
    try {
      const res = await fetch(`/api/getCampaigns`);

      if (!res.ok) {
        throw new Error("Failed to fetch campaigns");
      }

      const campaignData = await res.json();
      const data = campaignData.find(
        (campaign) => campaign.campaignId === campaignId
      );
      fetchVendor(data);
      console.log(data);
      setCampaign(data);

      // Check if campaign is found
      if (!data) {
        console.error("Campaign not found");
        return;
      }
      // Check campaign date range

      console.log(date);
      console.log(
        new Date(new Date(data.startDate.seconds * 1000).setHours(0, 0, 0, 0))
      );
      if (
        date <
          new Date(
            new Date(data.startDate.seconds * 1000).setHours(0, 0, 0, 0)
          ) || // Start date in the future
        date >
          new Date(
            new Date(data.endDate.seconds * 1000).setHours(23, 59, 59, 999)
          ) // End date in the past
      ) {
        setThankModal(true);
      } else {
        const userAllowed = await promptUser();

        if (userAllowed) {
          setShowModal(false);
          getLocation(data);
        } else {
          setShowModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
    }
  };

  // Get Location access permission
  const promptUser = () => {
    return new Promise((resolve) => {
      const userResponse = confirm(
        "We need your location to provide a better experience. Do you want to allow location access?"
      );
      resolve(userResponse);
    });
  };

  // Get Location
  const getLocation = async (campaign) => {
    if (navigator.geolocation) {
      setShowVideo(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const city = await getCityName(
            position.coords.latitude,
            position.coords.longitude
          );
          await fetchIp(campaign);
          await addCity(
            city,
            campaign,
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log("User denied the request for Geolocation.");
              setShowModal(true);
              break;
            case error.POSITION_UNAVAILABLE:
              console.log("Location information is unavailable.");
              setShowModal(true);
              break;
            case error.TIMEOUT:
              console.log("The request to get user location timed out.");
              setShowModal(true);
              break;
            case error.UNKNOWN_ERROR:
              console.log("An unknown error occurred.");
              setShowModal(true);
              break;
            default:
              console.log("An unknown error occurred.");
              setShowModal(true);
          }
        }
      );
    } else {
      setShowModal(true);
      console.log("Geolocation is not supported by this browser.");
    }
  };

  // Get City Name
  const getCityName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.address.state || "Unknown location";
    } catch (error) {
      console.log("Failed to fetch city name.");
    }
  };

  // fetch Ip address
  const fetchIp = async (campaign) => {
    try {
      // Fetch the IP address
      const res = await fetch("https://api.ipify.org?format=json");
      if (!res.ok) throw new Error("Failed to fetch IP address.");

      const data = await res.json();
      const ipAdd = data.ip;

      // Prepare the IP address entry
      const ipEntry = {
        createdAt: new Date().toISOString(),
        ip: ipAdd,
        hour: new Date().getHours(),
      };

      // Update the campaign's ipAddress field
      if (campaign.ipAddress) {
        campaign.ipAddress.push(ipEntry);
      } else {
        campaign.ipAddress = [ipEntry];
      }

      console.log(campaign);

      // Send the updated campaign data to the backend
      const response = await fetch("/api/updateCampaign", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cid: campaign.cid, ...campaign }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message || "Failed to update campaign.");
      }

      console.log("Campaign updated successfully.");
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  // handle ok for thanks
  const handleOk = async () => {
    setThankModal(false);
    if (campaign.redirects) {
      const response = await fetch("/api/updateCampaign", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cid: campaign.cid,
          redirects: campaign.redirects + 1,
        }),
      });
    } else {
      const response = await fetch("/api/updateCampaign", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cid: campaign.cid,
          redirects: 1,
        }),
      });
    }
    console.log("api worked");
    setShowVideo1(true);
  };

  const addCity = async (city, campaign, latitude, longitude) => {
    if (!campaign) {
      console.error("Campaign or campaign.cities is undefined");
      return;
    }

    const cities = { ...campaign.cities } || {};

    if (Object.keys(cities).length === 0) {
      cities[city] = 1;
    } else {
      if (cities.hasOwnProperty(city)) {
        cities[city] += 1;
      } else {
        cities[city] = 1;
      }
    }

    await fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then(async (data) => {
        const ipAddress = data.ip;
        const newLocation = { latitude, longitude };
        console.log(newLocation);
        if (campaign.locationIp) {
          if (campaign.locationIp.find((ip) => ip === ipAddress)) {
            try {
              const data = {
                location: campaign.location
                  ? [...campaign.location, newLocation]
                  : [newLocation],
              };
              console.log("campaign" + data.location);
              const response = await fetch("/api/updateCampaign", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ cid: campaign.cid, ...data }),
              });

              if (response.ok) {
                console.log("city added");
              } else {
                const responseData = await response.json();
                console.log(responseData.message);
              }
            } catch (error) {
              console.error("Error:", error);
            }
          } else {
            try {
              const data = {
                cities: cities,
                location: campaign.location
                  ? [...campaign.location, newLocation]
                  : [newLocation],
                locationIp: [...campaign.locationIp, ipAddress],
              };
              console.log("campaign-if" + data);
              const response = await fetch("/api/updateCampaign", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ cid: campaign.cid, ...data }),
              });

              if (response.ok) {
                console.log("city added");
              } else {
                const responseData = await response.json();
                console.log(responseData.message);
              }
            } catch (error) {
              console.error("Error:", error);
            }
          }
        } else {
          try {
            const data = {
              cities: cities,
              location: campaign.location
                ? [...campaign.location, newLocation]
                : [newLocation],
              locationIp: [ipAddress],
            };
            console.log("campaign" + data);
            const response = await fetch("/api/updateCampaign", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cid: campaign.cid, ...data }),
            });

            if (response.ok) {
              console.log("city added");
            } else {
              const responseData = await response.json();
              console.log(responseData.message);
            }
          } catch (error) {
            console.error("Error:", error);
          }
        }
      });
  };

  useEffect(() => {
    fetchCampaign();
  }, []);

  const handleVideoEnd = () => {
    setShowVideo(false);
    setSpinWheel(true);
  };

  const handleVideoEnd1 = () => {
    setShowVideo1(false);
    window.location.href = campaign.redirectLink;
  };

  const toggleMute = () => {
    setIsMuted((prevState) => !prevState);
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const fetchVendor = async (campaign) => {
    try {
      const res = await fetch("/api/getVendors");

      if (!res.ok) {
        throw new Error("Failed to fetch vendors");
      }

      const vendors = await res.json();

      // Ensure vendorId is defined and valid
      const data = vendors.find((vendor) => vendor.vendorId === vendorId);

      if (!data) {
        console.error(`Vendor with ID ${vendorId} not found`);
        return;
      }

      setVendor(data);

      const vid = data.vid;

      // Find the vendor in campaign vendors
      const pps = campaign.vendors.find((vendor) => vendor.vendorId === vid);

      if (!pps) {
        console.error(`Vendor with vid ${vid} not found in campaign`);
        return;
      }

      setPricePerScan(pps.pricePerScan);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#004643] flex flex-col items-center justify-center">
      {showVideo ? (
        campaign.advertisingVideo && (
          <>
            <video
              onEnded={handleVideoEnd}
              className="fixed top-0 left-0 w-screen h-screen object-cover"
              autoPlay
              muted
              preload="none"
              ref={videoRef}
            >
              <source
                className="w-screen h-screen"
                src={campaign.advertisingVideo}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
            <div
              onClick={toggleMute}
              className=" cursor-pointer absolute bottom-8 right-8 rounded-full text-2xl p-4 border border-gray-400 bg-[#ffffff46]"
            >
              {isMuted ? <MdVolumeOff /> : <IoMdVolumeHigh />}
            </div>
          </>
        )
      ) : showVideo1 ? (
        <>
          <video
            onEnded={handleVideoEnd1}
            className="fixed top-0 left-0 w-screen h-screen object-cover"
            autoPlay
            muted
            preload="none"
            ref={videoRef}
          >
            <source
              className="w-screen h-screen"
              src="/default.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
          <div
            onClick={toggleMute}
            className=" cursor-pointer absolute bottom-8 right-8 rounded-full text-2xl p-4 border border-gray-400 bg-[#ffffff46]"
          >
            {isMuted ? <MdVolumeOff /> : <IoMdVolumeHigh />}
          </div>
        </>
      ) : (
        spinWheel && <SpinWheel pricePerScan={pricePerScan} />
      )}
      {showModal && (
        <div className=" fixed flex justify-center items-center top-0 left-0 w-screen h-screen bg-[#00000090]">
          <div className=" p-8 bg-[#ffffff] min-h-[65vh] gap-8 rounded-xl w-1/3 min-w-[20rem] flex flex-col justify-center items-center ">
            <h3 className=" text-center leading-10 text-zinc-800 border-b font-semibold text-3xl border-zinc-400">
              Give Location Permission
            </h3>
            <p className=" text-xl text-zinc-700 font-medium leading-8 text-center">
              Please turn on your location permission internally from the
              browser settings to continue.
            </p>
            <p className=" text-xl text-zinc-700 font-medium leading-8 text-center">
              If you have enabled your location, kindly reload the page to
              proceed
            </p>
            <RevButton onClick={() => window.location.reload()}>
              Reload Page
            </RevButton>
          </div>
        </div>
      )}
      {thankModal && (
        <div className=" fixed flex justify-center items-center top-0 left-0 w-screen h-screen bg-[#00000090]">
          <div className=" p-8 bg-[#ffffff] min-h-[50vh] gap-8 rounded-xl w-1/3 min-w-[20rem] flex flex-col justify-center items-center ">
            <h3 className=" text-center leading-10 text-zinc-800 border-b font-semibold text-3xl border-zinc-400">
              Thank You for connecting!
            </h3>
            <p className=" text-xl text-zinc-700 font-medium leading-8 text-center">
              This campaign has been closed. Please wait for the next campaign
              to start.
            </p>
            <p className=" text-xl text-zinc-700 font-medium leading-8 text-center">
              <RevButton onClick={() => handleOk()}>OK</RevButton>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign;
