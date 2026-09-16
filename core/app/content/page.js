"use client";

import { apiFetch } from "@/utils/api";
import { showToast } from "@/utils/toast";
import { useEffect, useState } from "react";
import { INITIAL_WORK_FORM, INITIAL_TRAILHEAD_FORM, INITIAL_EXP_FORM } from "@/utils/basic";

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState("works");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState(INITIAL_WORK_FORM);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setLoading(true);
    setData(newTab === "trailhead" ? {} : []);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await apiFetch(`/api/user/${activeTab}`);
        if (!isMounted) return;

        if (activeTab === "trailhead") {
          setData(res.data || {});
        } else {
          setData(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (!isMounted) return;
        showToast.error(`Failed to load ${activeTab}: ` + err.message);
        setData(activeTab === "trailhead" ? {} : []);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const openCreateModal = () => {
    setSelectedItem(null);
    if (activeTab === "works") setFormData(INITIAL_WORK_FORM);
    if (activeTab === "experiences") setFormData(INITIAL_EXP_FORM);
    if (activeTab === "trailhead") setFormData(data || INITIAL_TRAILHEAD_FORM);
    setIsFormModalOpen(true);
  };

  const openUpdateModal = (item) => {
    setSelectedItem(item);
    if (activeTab === "works") {
      setFormData({
        ...item,
        stack: item.stack ? item.stack.join(", ") : "",
      });
    } else if (activeTab === "experiences") {
      setFormData({
        ...item,
        tags: item.tags ? item.tags.join(", ") : "",
      });
    }
    setIsFormModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    let payload = { ...formData };

    if (activeTab === "works" && typeof payload.stack === "string") {
      payload.stack = payload.stack
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (activeTab === "experiences" && typeof payload.tags === "string") {
      payload.tags = payload.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    try {
      if (activeTab === "trailhead") {
        const res = await apiFetch("/api/user/trailhead", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setData(res.data || {});
        showToast.success("Trailhead stats updated successfully");
      } else if (selectedItem) {
        const res = await apiFetch(`/api/user/${activeTab}/${selectedItem._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setData((prev) =>
          Array.isArray(prev) ? prev.map((item) => (item._id === selectedItem._id ? res.data : item)) : [],
        );
        showToast.success("Updated successfully");
      } else {
        const res = await apiFetch(`/api/user/${activeTab}`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setData((prev) => (Array.isArray(prev) ? [res.data, ...prev] : [res.data]));
        showToast.success("Created successfully");
      }
      setIsFormModalOpen(false);
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await apiFetch(`/api/user/${activeTab}/${selectedItem._id}`, {
        method: "DELETE",
      });
      setData((prev) => (Array.isArray(prev) ? prev.filter((item) => item._id !== selectedItem._id) : []));
      showToast.success("Deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const isListEmpty = !Array.isArray(data) || data.length === 0;

  return (
    <div className="p-4 md:p-6 max-w-6xl w-full mx-auto bg-white flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-black pb-4 mb-6 gap-4">
        <div>
          <h1 className="font-mono font-semibold uppercase tracking-normal text-lg">Content Manager</h1>
          <p className="text-xs font-mono text-gray-500 mt-1">Manage your dynamic portfolio content</p>
        </div>

        <button
          onClick={openCreateModal}
          className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-mono uppercase hover:bg-white hover:text-black transition-colors duration-150">
          {activeTab === "works" && "+ Create New Work"}
          {activeTab === "experiences" && "+ Create New Experience"}
          {activeTab === "trailhead" && "Edit Trailhead Stats"}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 font-mono text-sm">
        {["works", "experiences", "trailhead"].map((tab) => (
          <label key={tab} className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-4 h-4 border border-black">
              {activeTab === tab && <div className="w-2 h-2 bg-black"></div>}
            </div>
            <input
              type="radio"
              name="contentTab"
              value={tab}
              className="hidden"
              checked={activeTab === tab}
              onChange={(e) => handleTabChange(e.target.value)}
            />
            <span className={`uppercase ${activeTab === tab ? "font-bold" : "text-gray-500 group-hover:text-black"}`}>
              {tab}
            </span>
          </label>
        ))}
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center font-mono text-xs uppercase h-32">Loading Content...</div>
        ) : activeTab === "works" ? (
          isListEmpty ? (
            <div className="border border-dashed border-black p-12 text-center text-sm font-mono text-gray-500">
              {'No works found. Click "+ Create New Work" to add one.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.map((work) => (
                <div key={work._id} className="border border-black bg-white flex flex-col">
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg leading-tight">{work.title}</h3>
                      <span className="text-[10px] font-mono border border-black px-2 py-0.5 whitespace-nowrap">
                        {work.when}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-gray-600 mt-1">{work.tagline}</p>
                    <p className="text-sm mt-3 line-clamp-3">{work.description}</p>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {work.stack?.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono bg-gray-100 text-black px-2 py-0.5 border border-gray-300">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto pt-6 flex gap-3">
                      <button
                        onClick={() => openUpdateModal(work)}
                        className="flex-1 border border-black px-3 py-1.5 text-xs font-mono uppercase hover:bg-black hover:text-white transition-colors">
                        Update
                      </button>
                      <button
                        onClick={() => openDeleteModal(work)}
                        className="flex-1 border border-black px-3 py-1.5 text-xs font-mono uppercase hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === "experiences" ? (
          isListEmpty ? (
            <div className="border border-dashed border-black p-12 text-center text-sm font-mono text-gray-500">
              {'No experiences found. Click "+ Create New Experience" to add one.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.map((exp) => (
                <div key={exp._id} className="border border-black bg-white p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{exp.title}</h3>
                        <p className="text-xs font-mono text-gray-600 font-semibold">{exp.company}</p>
                      </div>
                      <span className="text-[10px] font-mono border border-black px-2 py-0.5 whitespace-nowrap">
                        {exp.timeline}
                      </span>
                    </div>

                    <p className="text-xs font-mono uppercase text-gray-500 mt-2">Type: {exp.type}</p>
                    <p className="text-sm mt-3 leading-relaxed">{exp.description}</p>

                    <div className="mt-4 flex flex-wrap gap-1">
                      {exp.tags?.map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono bg-gray-100 text-black px-2 py-0.5 border border-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 flex gap-3 mt-auto">
                    <button
                      onClick={() => openUpdateModal(exp)}
                      className="flex-1 border border-black px-3 py-1.5 text-xs font-mono uppercase hover:bg-black hover:text-white transition-colors">
                      Update
                    </button>
                    <button
                      onClick={() => openDeleteModal(exp)}
                      className="flex-1 border border-black px-3 py-1.5 text-xs font-mono uppercase hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="border border-black p-6 bg-white max-w-xl">
            <h3 className="font-mono font-bold uppercase text-base mb-4 border-b border-black pb-2">
              Trailhead Stats Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div>
                <span className="text-gray-500 block uppercase">Rank Title</span>
                <span className="font-bold text-sm">{data?.rankTitle || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Points</span>
                <span className="font-bold text-sm">{data?.points || "0"}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Badges</span>
                <span className="font-bold text-sm">{data?.badges || "0"}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Superbadges</span>
                <span className="font-bold text-sm">{data?.superbadges || "0"}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Trails</span>
                <span className="font-bold text-sm">{data?.trails || "0"}</span>
              </div>
            </div>

            <button
              onClick={openCreateModal}
              className="mt-6 w-full border border-black bg-black text-white p-2.5 text-xs uppercase font-mono hover:bg-white hover:text-black transition-colors">
              Edit Trailhead Stats
            </button>
          </div>
        )}
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white border border-black max-h-[90vh] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="p-4 border-b border-black flex justify-between items-center bg-black text-white">
              <h3 className="font-mono font-bold uppercase tracking-widest text-sm">
                {activeTab === "trailhead"
                  ? "Update Trailhead Stats"
                  : selectedItem
                    ? `Update ${activeTab.slice(0, -1)}`
                    : `Create New ${activeTab.slice(0, -1)}`}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="font-mono hover:text-gray-300">
                [X]
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="contentForm" onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
                {activeTab === "works" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="work-title" className="block uppercase mb-1">
                          Title
                        </label>
                        <input
                          id="work-title"
                          required
                          type="text"
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.title || ""}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="work-tagline" className="block uppercase mb-1">
                          Tagline
                        </label>
                        <input
                          id="work-tagline"
                          required
                          type="text"
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.tagline || ""}
                          onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="work-when" className="block uppercase mb-1">
                          Timeline (When)
                        </label>
                        <input
                          id="work-when"
                          required
                          type="text"
                          placeholder="e.g. 2025 - Present"
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.when || ""}
                          onChange={(e) => setFormData({ ...formData, when: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="work-type" className="block uppercase mb-1">
                          Project Type
                        </label>
                        <input
                          id="work-type"
                          required
                          type="text"
                          placeholder="e.g. Full Stack"
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.type || ""}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="work-image" className="block uppercase mb-1">
                          Image URL
                        </label>
                        <input
                          id="work-image"
                          type="text"
                          placeholder="https://..."
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.image || ""}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="work-url" className="block uppercase mb-1">
                          Live URL
                        </label>
                        <input
                          id="work-url"
                          type="url"
                          placeholder="https://..."
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.url || ""}
                          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="work-stack" className="block uppercase mb-1">
                        Tech Stack (Comma Separated)
                      </label>
                      <input
                        id="work-stack"
                        type="text"
                        placeholder="React, Next.js, Tailwind..."
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                        value={formData.stack || ""}
                        onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="work-description" className="block uppercase mb-1">
                        Description
                      </label>
                      <textarea
                        id="work-description"
                        required
                        rows="4"
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50 resize-none"
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>
                  </>
                )}

                {activeTab === "experiences" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="exp-title" className="block uppercase mb-1">
                          Job Title
                        </label>
                        <input
                          id="exp-title"
                          required
                          type="text"
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.title || ""}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="exp-company" className="block uppercase mb-1">
                          Company
                        </label>
                        <input
                          id="exp-company"
                          required
                          type="text"
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.company || ""}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="exp-timeline" className="block uppercase mb-1">
                          Timeline
                        </label>
                        <input
                          id="exp-timeline"
                          required
                          type="text"
                          placeholder="e.g. Jan 2025 - Present"
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.timeline || ""}
                          onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="exp-type" className="block uppercase mb-1">
                          Employment Type
                        </label>
                        <input
                          id="exp-type"
                          required
                          type="text"
                          placeholder="e.g. Full-Time"
                          className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                          value={formData.type || ""}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="exp-tags" className="block uppercase mb-1">
                        Tags / Skills (Comma Separated)
                      </label>
                      <input
                        id="exp-tags"
                        type="text"
                        placeholder="React, Node.js, Leadership..."
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                        value={formData.tags || ""}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="exp-description" className="block uppercase mb-1">
                        Description
                      </label>
                      <textarea
                        id="exp-description"
                        required
                        rows="4"
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50 resize-none"
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
                    </div>
                  </>
                )}

                {activeTab === "trailhead" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="trail-rankTitle" className="block uppercase mb-1">
                        Rank Title
                      </label>
                      <input
                        id="trail-rankTitle"
                        required
                        type="text"
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                        value={formData.rankTitle || ""}
                        onChange={(e) => setFormData({ ...formData, rankTitle: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="trail-rankImg" className="block uppercase mb-1">
                        Rank Image URL
                      </label>
                      <input
                        id="trail-rankImg"
                        type="url"
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                        value={formData.rankImg || ""}
                        onChange={(e) => setFormData({ ...formData, rankImg: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="trail-points" className="block uppercase mb-1">
                        Points
                      </label>
                      <input
                        id="trail-points"
                        required
                        type="text"
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                        value={formData.points || ""}
                        onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="trail-badges" className="block uppercase mb-1">
                        Badges
                      </label>
                      <input
                        id="trail-badges"
                        required
                        type="text"
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                        value={formData.badges || ""}
                        onChange={(e) => setFormData({ ...formData, badges: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="trail-superbadges" className="block uppercase mb-1">
                        Superbadges
                      </label>
                      <input
                        id="trail-superbadges"
                        required
                        type="text"
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                        value={formData.superbadges || ""}
                        onChange={(e) => setFormData({ ...formData, superbadges: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="trail-trails" className="block uppercase mb-1">
                        Trails
                      </label>
                      <input
                        id="trail-trails"
                        required
                        type="text"
                        className="w-full border border-black p-2 focus:outline-none focus:bg-gray-50"
                        value={formData.trails || ""}
                        onChange={(e) => setFormData({ ...formData, trails: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="p-4 border-t border-black flex justify-end gap-3 bg-gray-50">
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="border border-black px-6 py-2 text-xs font-mono uppercase hover:bg-white transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                form="contentForm"
                className="border border-black bg-black text-white px-6 py-2 text-xs font-mono uppercase hover:bg-white hover:text-black transition-colors">
                {activeTab === "trailhead" ? "Save Stats" : selectedItem ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-mono font-bold uppercase border-b border-black pb-2 mb-4">Confirm Delete</h3>
            <p className="text-sm font-mono text-gray-700">
              Permanently delete <span className="font-bold text-black">&quot;{selectedItem?.title}&quot;</span>? This
              action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="border border-black px-4 py-2 text-xs font-mono uppercase hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-mono uppercase bg-black text-white border border-black hover:bg-white hover:text-black transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
