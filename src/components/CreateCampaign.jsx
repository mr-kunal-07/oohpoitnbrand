"use client";
import { storage } from "@/firebase";
import {
  uploadBytes,
  ref as storageRef,
  getDownloadURL,
} from "firebase/storage";
import React, { useEffect, useState } from "react";

const CreateCampaign = () => {
  const [campaignName, setCampaignName] = useState("");
  const [moq, setMoq] = useState("");
  const [ta, setTa] = useState("");
  const [targetAudience, setTargetAudience] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [geoTarget, setGeoTarget] = useState("");
  const [geoTargets, setGeoTargets] = useState([]);
  const [qrTag, setQrTag] = useState("");
  const [qrTags, setQrTags] = useState([]);
  const [placementChannel, setPlacementChannel] = useState("");
  const [client, setClient] = useState("");
  const [budget, setBudget] = useState("");
  const [objective, setObjective] = useState("");
  const [reportFreq, setReportFreq] = useState("");
  const [adCreativeImage, setAdCreativeImage] = useState(null);
  const [adVideo, setAdVideo] = useState(null);
  const [redirectLink, setRedirectLink] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([
    {
      question: "",
      options: [""],
      correctOption: null, // Index of the correct option
    },
  ]);
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: "", options: [""] }]);
  };

  const removeQuestion = (index) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const addOption = (index) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[index].options.push("");
    setQuizQuestions(updatedQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options = updatedQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    setQuizQuestions(updatedQuestions);
  };

  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[index].question = value;
    setQuizQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuizQuestions(updatedQuestions);
  };

  const fetchClients = async () => {
    const res = await fetch('/api/getBrands')
   
    if (!res.ok) {
      throw new Error("Failed to fetch clients");
    }

    const data = await res.json();
    setClients(data.reverse())
    console.log(data)
  }

  useEffect(() => {
    fetchClients()
  }, [])
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let adCreativeUrl = null
    let advertisingVideoUrl = null

    try {
      // Validate that adCreativeImage and adVideo are present
      if (!adCreativeImage || !adVideo) {
        throw new Error("Missing image or video file");
      }
    
      // Reference for the image
      const adCreativeRef = storageRef(storage, `adCreatives/${adCreativeImage.name}`);
    
      // Upload image and get URL
      const adCreativeSnapshot = await uploadBytes(adCreativeRef, adCreativeImage);
     adCreativeUrl = await getDownloadURL(adCreativeRef);
    
      // Reference for the video
      const advertisingVideoRef = storageRef(storage, `advertisingVideos/${adVideo.name}`);
    
      // Upload video and get URL
      const advertisingVideoSnapshot = await uploadBytes(advertisingVideoRef, adVideo);
     advertisingVideoUrl = await getDownloadURL(advertisingVideoRef);
    
      console.log("Image URL:", adCreativeUrl);
      console.log("Video URL:", advertisingVideoUrl);
    
      console.log("Video and image uploaded successfully");
    
    } catch (error) {
      console.error("Error during upload:", error.message || error);
    }
    

    const campaignData = {
      campaignName,
      moq,
      targetAudience,
      startDate,
      endDate,
      geographicTargeting: geoTargets,
      qrCodeTags: qrTags,
      placementChannel,
      client,
      campaignBudget: budget,
      campaignObjectives: objective,
      reportingFrequency: reportFreq,
      advertisingVideo: advertisingVideoUrl, // Make sure this is a URL or similar identifier
      adCreative: adCreativeUrl, // Make sure this is a URL or similar identifier
      redirectLink,
      quizQuestions, 
    };

    try {
      const response = await fetch("/api/createCampaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      const result = await response.json();
      if (response.ok) {
        // Handle success (e.g., show a success message)
        console.log("done")
      } else {
        // Handle errors (e.g., show an error message)
        console.error("Error creating campaign:", result);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error creating campaign:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full grid gap-8 grid-cols-4 pb-8"
    >
      <div className=" ">
        {/* Campaign Name */}
        <label className="block text-gray-800 font-medium">Campaign Name</label>
        <input
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
          type="text"
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          placeholder="Enter campaign name"
        />
      </div>

      <div className=" ">
        {/* MOQ */}
        <label className="block text-gray-800 font-medium">MOQ</label>
        <input
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
          type="number"
          value={moq}
          onChange={(e) => setMoq(e.target.value)}
          placeholder="Enter MOQ"
        />
      </div>

      <div className=" ">
        {/* Target Audience (Multiple values) */}
        <label className="block text-gray-800 font-medium">
          Target Audience
        </label>
        <input
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
          type="text"
          value={ta}
          onChange={(e) => setTa(e.target.value)}
          placeholder="Enter target audience"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              setTa("");
              setTargetAudience([...targetAudience, e.target.value]);
            }
          }}
        />
        <div className="mt-1 flex flex-wrap w-full mb-2 border border-gray-300 justify-start items-center rounded-md ">
          {targetAudience.length > 0 &&
            targetAudience.map((ta, index) => (
              <span
                className=" cursor-pointer border bg-white py-1 px-4 m-2 border-primary rounded-full"
                key={index}
                onClick={() =>
                  setTargetAudience(targetAudience.filter((tg) => tg !== ta))
                }
              >
                {ta}
              </span>
            ))}
        </div>
      </div>

      {/* Start Date */}
      <div className="">
        <label className="block text-gray-800 font-medium">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
        />
      </div>

      {/* End Date */}
      <div className="">
        <label className="block text-gray-800 font-medium">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
        />
      </div>

      <div className=" ">
        {/* Geographic Targeting */}
        <label className="block text-gray-800 font-medium">
          Geographic Targeting
        </label>
        <input
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
          type="text"
          value={geoTarget}
          onChange={(e) => setGeoTarget(e.target.value)}
          placeholder="Enter geographic targeting"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              setGeoTarget("");
              setGeoTargets([...geoTargets, e.target.value]);
            }
          }}
        />
        <div className="mt-1 flex flex-wrap w-full mb-2 border border-gray-300 justify-start items-center rounded-md ">
          {geoTargets.length > 0 &&
            geoTargets.map((gt, index) => (
              <span
                className=" cursor-pointer border bg-white py-1 px-4 m-2 border-primary rounded-full"
                key={index}
                onClick={() =>
                  setGeoTargets(geoTargets.filter((tg) => tg !== gt))
                }
              >
                {gt}
              </span>
            ))}
        </div>
      </div>

      {/* QR Code Tags */}
      <div className=" ">
        <label className="block text-gray-800 font-medium">QR Code Tags</label>
        <input
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
          type="text"
          value={qrTag}
          onChange={(e) => setQrTag(e.target.value)}
          placeholder="Enter QR code tags"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              setQrTag("");
              setQrTags([...qrTags, e.target.value]);
            }
          }}
        />
        <div className="mt-1 flex flex-wrap w-full mb-2 border border-gray-300 justify-start items-center rounded-md ">
          {qrTags.length > 0 &&
            qrTags.map((tag, index) => (
              <span
                className=" cursor-pointer border bg-white py-1 px-4 m-2 border-primary rounded-full"
                key={index}
                onClick={() => setQrTags(qrTags.filter((tg) => tg !== tag))}
              >
                {tag}
              </span>
            ))}
        </div>
      </div>

      {/* Placement Channel Dropdown */}
      <div className="">
        <label className="block text-gray-800 font-medium">
          Placement Channel
        </label>
        <select
          value={placementChannel}
          onChange={(e) => setPlacementChannel(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-lg p-[0.6rem] pr-4 shadow-md "
        >
          <option value="" disabled>
            Select a channel
          </option>
          {/* Add options here */}
          <option value="mineralWater">Mineral Water</option>
          <option value="carbonatedWater">Carbonated Water</option>
          <option value="energyDrink">Energy Drink</option>
          <option value="fruitJuices">Fruit Juices</option>
        </select>
      </div> 

      {/* Client Dropdown */}
      <div className="">
        <label className="block text-gray-800 font-medium">Client</label>
        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-lg p-[0.6rem] pr-4 shadow-md "
        >
          <option value="" disabled>
            Select a client
          </option>
          {
            clients.map((cl) => (
            <option value={cl.brandId}>
              {cl.brandName} - {cl.brandId}
            </option>
            ))
          }
          
          {/* Add options here */}
        </select>
      </div>

      {/* Campaign Budget */}
      <div className=" ">
        <label className="block text-gray-800 font-medium">
          Campaign Budget
        </label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Enter campaign budget"
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
        />
      </div>

      {/* Campaign Objective */}
      <div className=" ">
        <label className="block text-gray-800 font-medium">
          Campaign Objective
        </label>
        <input
          type="text"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Enter campaign objective"
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
        />
      </div>

      {/* Reporting Frequency */}
      <div className=" ">
        <label className="block text-gray-800 font-medium">
          Reporting Frequency
        </label>
        <input
          type="text"
          value={reportFreq}
          onChange={(e) => setReportFreq(e.target.value)}
          placeholder="Enter reporting frequency"
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
        />
      </div>

      {/* Ad Creative Image */}
      <div className="">
        <label className="block text-gray-800 font-medium">
          Ad Creative Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAdCreativeImage(e.target.files[0])}
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
        />
      </div>

      {/* Advertising Video */}
      <div className="">
        <label className="block text-gray-800 font-medium">
          Advertising Video
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setAdVideo(e.target.files[0])}
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
        />
      </div>

      {/* Redirect Link */}
      <div className=" ">
        <label className="block text-gray-800 font-medium">Redirect Link</label>
        <input
          type="url"
          value={redirectLink}
          onChange={(e) => setRedirectLink(e.target.value)}
          placeholder="https://"
          className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
        />
      </div>

      {/* MCQ Quiz Questions */}
      <div className=" col-span-2">
        <label className="block text-gray-800 font-medium">
          Quiz Questions
        </label>
        {quizQuestions.map((question, index) => (
          <div key={index} className="mb-4">
            <input
              type="text"
              value={question.question}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              placeholder="Enter question"
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md "
            />
            <div className="mt-2">
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      handleOptionChange(index, optIndex, e.target.value)
                    }
                    placeholder={`Option ${optIndex + 1}`}
                    className="mr-2 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                  />
                  <label className="ml-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={question.correctOption === optIndex}
                      onChange={() => {
                        const updatedQuestions = [...quizQuestions];
                        updatedQuestions[index].correctOption = optIndex;
                        setQuizQuestions(updatedQuestions);
                      }}
                    />
                    Correct
                  </label>
                  <button
                    className="ml-2 p-2 bg-red-500 text-white rounded-lg"
                    onClick={() => removeOption(index, optIndex)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
                onClick={() => addOption(index)}
              >
                Add Option
              </button>
            </div>
            <button
              className="mt-2 p-2 bg-red-500 text-white rounded-lg"
              onClick={() => removeQuestion(index)}
            >
              Remove Question
            </button>
          </div>
        ))}

        <button
          className="mt-2 p-2 bg-green-500 text-white rounded-lg"
          onClick={addQuestion}
        >
          Add Question
        </button>
      </div>
      <div className="flex justify-end flex-col gap-3 ">
        <button
          className="bg-oohpoint-primary-1 text-white font-semibold px-5 py-2 rounded-lg mt-2 hover:scale-90 transition-all"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Creating..." : "Create Campaign"}
        </button>
      </div>
    </div>
  );
};

export default CreateCampaign;
