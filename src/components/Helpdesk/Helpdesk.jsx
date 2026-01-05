"use client";
import React, { useContext, useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  setDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-hot-toast";
import { MyContext } from "@/context/MyContext";
import DynamicTable from "../NewTable";

const HelpDesk = () => {
  const { user } = useContext(MyContext);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [conversationDialogOpen, setConversationDialogOpen] = useState(false);
  const [issueMessage, setIssueMessage] = useState("");
  const [reopenMessage, setReopenMessage] = useState("");
  const [queries, setQueries] = useState([]);
  const [filteredQueries, setFilteredQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [selectedQueryId, setSelectedQueryId] = useState(null);
  const [category, setCategory] = useState(""); // State for selected category
  const [filter, setFilter] = useState("Opened"); // Default filter
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (user) {
      fetchQueries();
    }
  }, [user]);

  // Fetch queries and filter based on the selected filter
  const fetchQueries = async () => {
    try {
      const q = query(
        collection(db, "brandQueries"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const queriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        customerName: doc.data().customerName,
        email: doc.data().email,
        category: doc.data().category,
        createdAt: new Date(doc.data().createdAt.toDate()).toLocaleString(),
        openMessage: doc.data().openMessage,
        resolvedMessage: doc.data().resolvedMessage || "",
        reopenedMessage: doc.data().reopenedMessage || "",
        closedMessage: doc.data().closedMessage || "",
        status: doc.data().status,
        queryId: doc.data().queryId,
        brandId: doc.data().brandId,
      }));
      const data = queriesData.filter(
        (query) => query.brandId === user.brandId
      );
      setQueries(data.reverse());
      filterQueries(data, filter); // Apply filter when fetching
    } catch (error) {
      console.error("Error fetching queries:", error);
    }
  };

  const filterQueries = (queriesData, status) => {
    const filtered = queriesData.filter((query) => query.status === status);
    setFilteredQueries(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    filterQueries(queries, newFilter);
  };

  const handleSubmitIssue = async () => {
    if (!issueMessage || !category) {
      toast.error("Please fill out all the fields.");
      return;
    }

    const queryId = `BQ${Date.now()}`;

    try {
      const queryRef = doc(db, "brandQueries", queryId);

      await setDoc(queryRef, {
        category,
        customerName: user.name,
        email: user.email,
        openMessage: issueMessage,
        status: "Opened",
        createdAt: new Date(),
        resolvedMessage: "",
        closedMessage: "",
        reopenedMessage: "",
        queryId: queryId,
        brandId: user.brandId,
      });

      toast.success("Issue submitted successfully!");
      setIssueDialogOpen(false);
      setIssueMessage("");
      setCategory("");
      fetchQueries();
    } catch (error) {
      console.error("Error submitting issue:", error);
      toast.error("Failed to submit issue. Please try again.");
    }
  };

  const handleOpenReopenModal = (queryId) => {
    setSelectedQueryId(queryId);
    setReopenDialogOpen(true);
  };

  const handleSubmitReopen = async () => {
    if (!reopenMessage) {
      toast.error("Please enter a message.");
      return;
    }

    try {
      const queryRef = doc(db, "brandQueries", selectedQueryId);

      await updateDoc(queryRef, {
        status: "Reopened",
        reopenedMessage: reopenMessage,
      });

      toast.success("Issue reopened!");
      setReopenDialogOpen(false);
      setReopenMessage("");
      fetchQueries();
    } catch (error) {
      console.error("Error reopening issue:", error);
      toast.error("Failed to reopen issue. Please try again.");
    }
  };

  const tableHeadings = ["Brand", "Query Id", "Category", "Created At", "", ""];
  const handleRowAction = (queryId) => {
    handleOpenConversationModal(queryId);
  };

  const handleOpenConversationModal = (queryId) => {
    const query = queries.find((q) => q.id === queryId);
    if (query) {
      setSelectedQuery(query);
      setConversationDialogOpen(true);
    } else {
      toast.error("Failed to open conversation. Query not found.");
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);

    // Perform search within the filtered queries based on the selected status (filter)
    const filtered = queries
      .filter((query) => query.status === filter) // Ensure queries are filtered by the selected status
      .filter(
        (query) =>
          query.queryId.toLowerCase().includes(e.target.value.toLowerCase()) ||
          query.customerName
            .toLowerCase()
            .includes(e.target.value.toLowerCase())
      );

    setFilteredQueries(filtered);

    // If the search text is cleared, apply the filter again to reset the filtered queries
    if (e.target.value === "") {
      filterQueries(queries, filter);
    }
  };

  return (
    <div className="p-6 px-12 w-full">
      <div className="flex justify-between items-center mb-6 w-full">
        <h1 className="text-3xl font-bold">Helpdesk</h1>

        <button
          className="bg-oohpoint-primary-2 hover:bg-oohpoint-primary-3 text-white py-2 px-6 rounded-xl hover:scale-95 transition-all"
          onClick={() => setIssueDialogOpen(true)}
        >
          Raise an Issue
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => handleFilterChange("Opened")}
            className={`px-4 py-2 rounded-lg transition-all  ${
              filter === "Opened"
                ? " text-oohpoint-primary-1"
                : "text-oohpoint-primary-2"
            }`}
          >
            Opened
          </button>
          <button
            onClick={() => handleFilterChange("Resolved")}
            className={`px-4 py-2 rounded-lg transition-all  ${
              filter === "Resolved"
                ? " text-oohpoint-primary-1"
                : "text-oohpoint-primary-2"
            }`}
          >
            Resolved
          </button>
          <button
            onClick={() => handleFilterChange("Reopened")}
            className={`px-4 py-2 rounded-lg transition-all  ${
              filter === "Reopened"
                ? " text-oohpoint-primary-1"
                : "text-oohpoint-primary-2"
            }`}
          >
            Re-Opened
          </button>
          <button
            onClick={() => handleFilterChange("Closed")}
            className={`px-4 py-2 rounded-lg transition-all  ${
              filter === "Closed"
                ? " text-oohpoint-primary-1"
                : "text-oohpoint-primary-2"
            }`}
          >
            Closed
          </button>
        </div>
        <input
          type="text"
          placeholder="Search"
          className="px-4 py-1 rounded-lg"
          value={searchText}
          onChange={(e) => handleSearch(e)}
        />
      </div>

      <DynamicTable
        headings={tableHeadings}
        data={filteredQueries.map((query) => ({
          Name: query.customerName,
          id: query.queryId,
          "Phone Number": query.category,
          Date: new Date(query.createdAt).toLocaleDateString(),
          action: query.status === "Resolved" ? "Reopen" : query.status,
          view: "View",
        }))}
        rowsPerPage={4}
        pagination={true}
        functionn={handleOpenReopenModal}
        view={handleRowAction}
      />

      {/* Dialog for raising a new issue */}
      {issueDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-all">
          <div className="bg-white p-6 px-10 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Raise an Issue</h2>

            {/* Category Dropdown */}
            <select
              className="w-full border rounded-3xl p-4 mb-4 bg-oohpoint-grey-200 font-light"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a Category</option>
              <option value="Account Related">Account related</option>
              <option value="Payment Issue">Payment Issue</option>
              <option value="Technical Issue">Technical Issue</option>
              <option value="Other">Other</option>
            </select>

            <textarea
              className="w-full border rounded-3xl p-4 mb-4 bg-oohpoint-grey-200 font-light"
              rows="4"
              placeholder="Describe your issue"
              value={issueMessage}
              onChange={(e) => setIssueMessage(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-white py-2 px-6 rounded-xl hover:bg-gray-600"
                onClick={() => setIssueDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-oohpoint-primary-2 text-white py-2 px-6 rounded-xl hover:bg-oohpoint-primary-3"
                onClick={handleSubmitIssue}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for viewing conversations */}
      {conversationDialogOpen && selectedQuery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-all ">
          <div className="bg-white p-6 px-10 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              Query Details - {selectedQuery.queryId}
            </h2>
            <div className="mb-4">
              <h3 className="font-semibold">Open Message:</h3>
              <p className="bg-oohpoint-grey-200 rounded-3xl p-4">
                {selectedQuery.openMessage}
              </p>
            </div>
            {selectedQuery.resolvedMessage && (
              <div className="mb-4">
                <h3 className="font-semibold">Resolved Message:</h3>
                <p className="bg-oohpoint-grey-200 rounded-3xl p-4">
                  {selectedQuery.resolvedMessage}
                </p>
              </div>
            )}
            {selectedQuery.reopenedMessage && (
              <div className="mb-4">
                <h3 className="font-semibold">Reopened Message:</h3>
                <p className="bg-oohpoint-grey-200 rounded-3xl p-4">
                  {selectedQuery.reopenedMessage}
                </p>
              </div>
            )}
            {selectedQuery.closedMessage && (
              <div className="mb-4">
                <h3 className="font-semibold">Closed Message:</h3>
                <p className="bg-oohpoint-grey-200 rounded-3xl p-4">
                  {selectedQuery.closedMessage}
                </p>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-white py-2 px-6 rounded-xl hover:bg-gray-600"
                onClick={() => setConversationDialogOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for reopening an issue */}
      {reopenDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center transition-all">
          <div className="bg-white p-6 px-10 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Reopen Issue</h2>
            <textarea
              className="w-full border rounded-3xl p-4 mb-4 bg-oohpoint-grey-200 font-light"
              rows="4"
              placeholder="Enter reason to reopen"
              value={reopenMessage}
              onChange={(e) => setReopenMessage(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-500 text-white py-2 px-6 rounded-xl hover:bg-gray-600"
                onClick={() => setReopenDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-oohpoint-primary-2 text-white py-2 px-6 rounded-xl hover:bg-oohpoint-primary-3"
                onClick={handleSubmitReopen}
              >
                Reopen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpDesk;
