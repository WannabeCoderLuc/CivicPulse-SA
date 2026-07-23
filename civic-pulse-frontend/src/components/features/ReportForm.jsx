import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { submitReport } from "../../services/api";
import { emitReportSubmitted } from "../../services/socket";
import { useAppContext } from "../../context/AppContext";
import { CATEGORIES, WARDS } from "../../mock/constants";
import { getCategoryIcon } from "../../utils/helpers";

const DEFAULT_COORDS = { latitude: -33.9249, longitude: 18.4241 };

export default function ReportForm() {
  console.log("ENTER: ReportForm render");

  const { dispatch, loadKpi } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [useCustomCoords, setUseCustomCoords] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      ward: "",
      reportedBy: "",
      latitude: DEFAULT_COORDS.latitude,
      longitude: DEFAULT_COORDS.longitude,
      imageUrl: "",
    },
  });

  const selectedCategory = watch("category");

  const onSubmit = async (formData) => {
    console.log("ENTER: ReportForm.onSubmit", formData);
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        ward: formData.ward,
        reportedBy: formData.reportedBy.trim() || "Anonymous Citizen",
        latitude: parseFloat(formData.latitude) || DEFAULT_COORDS.latitude,
        longitude: parseFloat(formData.longitude) || DEFAULT_COORDS.longitude,
        imageUrl: formData.imageUrl || "",
      };

      const newReport = await submitReport(payload);
      console.log(`SUCCESS: ReportForm submitted — id=${newReport.id}`);

      dispatch({ type: "ADD_REPORT", payload: newReport });
      console.log("STATE_CHANGE: ADD_REPORT dispatched");

      emitReportSubmitted(newReport);

      await loadKpi();

      setSubmitted(true);
      reset();
      setTimeout(() => {
        console.log("STATE_CHANGE: ReportForm.submitted reset to false");
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error(`ERR-FORM-001: ReportForm.onSubmit failed. ${err.message}`);
      window.alert(`ERR-FORM-001: Failed to submit report. Please try again.\n\nDetail: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card text-center py-12"
      >
        <div className="text-5xl mb-4">?</div>
        <h3 className="text-xl font-bold text-white mb-2">Report Submitted Successfully</h3>
        <p className="text-gray-400 text-sm">
          Your incident has been logged with the municipality. A reference number has been assigned.
          You will receive updates as the issue progresses.
        </p>
        <p className="text-gray-600 text-xs mt-4">This notice will dismiss automatically…</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card max-w-2xl"
    >
      <h2 className="text-lg font-bold text-white mb-1">Report a Municipal Issue</h2>
      <p className="text-gray-500 text-sm mb-6">
        Submit an infrastructure issue for assessment by municipal technicians.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="form-label">Issue Title *</label>
          <input
            {...register("title", { required: "Issue title is required", minLength: { value: 5, message: "Title must be at least 5 characters" } })}
            className="form-input"
            placeholder="e.g. Burst Water Main on Voortrekker Road"
          />
          {errors.title && <p className="form-error">{errors.title.message}</p>}
        </div>

        <div>
          <label className="form-label">Category *</label>
          <div className="grid grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => (
              <label
                key={cat}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedCategory === cat
                    ? "border-civic-blue bg-civic-blue/20 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                }`}
              >
                <input
                  type="radio"
                  value={cat}
                  {...register("category", { required: "Please select a category" })}
                  className="sr-only"
                />
                <span className="text-xl">{getCategoryIcon(cat)}</span>
                <span className="text-xs font-medium">{cat}</span>
              </label>
            ))}
          </div>
          {errors.category && <p className="form-error">{errors.category.message}</p>}
        </div>

        <div>
          <label className="form-label">Description *</label>
          <textarea
            {...register("description", { required: "Description is required", minLength: { value: 10, message: "Please provide more detail" } })}
            className="form-input resize-none"
            rows={4}
            placeholder="Describe the issue in detail — location specifics, severity, duration, etc."
          />
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Ward *</label>
            <select
              {...register("ward", { required: "Please select a ward" })}
              className="form-input"
            >
              <option value="">Select ward…</option>
              {WARDS.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
            {errors.ward && <p className="form-error">{errors.ward.message}</p>}
          </div>

          <div>
            <label className="form-label">Your Name (Optional)</label>
            <input
              {...register("reportedBy")}
              className="form-input"
              placeholder="e.g. Sipho Dlamini"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label mb-0">Location Coordinates</label>
            <button
              type="button"
              onClick={() => {
                console.log("STATE_CHANGE: ReportForm.useCustomCoords toggled");
                setUseCustomCoords((v) => !v);
              }}
              className="text-xs text-civic-gold hover:text-yellow-300 transition-colors"
            >
              {useCustomCoords ? "Use Default" : "Enter Custom Coords"}
            </button>
          </div>
          {useCustomCoords ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  {...register("latitude", {
                    required: "Latitude required",
                    validate: (v) => (!isNaN(parseFloat(v))) || "Must be a number",
                  })}
                  className="form-input"
                  placeholder="Latitude e.g. -33.9249"
                />
                {errors.latitude && <p className="form-error">{errors.latitude.message}</p>}
              </div>
              <div>
                <input
                  {...register("longitude", {
                    required: "Longitude required",
                    validate: (v) => (!isNaN(parseFloat(v))) || "Must be a number",
                  })}
                  className="form-input"
                  placeholder="Longitude e.g. 18.4241"
                />
                {errors.longitude && <p className="form-error">{errors.longitude.message}</p>}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-600 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700">
              ?? Default: Cape Town CBD (-33.9249, 18.4241) — toggle above to specify exact coordinates
            </p>
          )}
        </div>

        <div>
          <label className="form-label">Image Reference (Optional)</label>
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-gray-600 transition-colors">
            <p className="text-gray-500 text-sm">?? Image upload simulation</p>
            <input
              {...register("imageUrl")}
              className="form-input mt-3"
              placeholder="Paste image URL or leave blank"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting to Municipality…
              </>
            ) : (
              "?? Submit Report"
            )}
          </motion.button>
          <button
            type="button"
            onClick={() => {
              console.log("STATE_CHANGE: ReportForm.reset triggered");
              reset();
            }}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </form>
    </motion.div>
  );
}
