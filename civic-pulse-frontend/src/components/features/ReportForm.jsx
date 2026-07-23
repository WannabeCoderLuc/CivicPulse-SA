import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Loader2, Send, RotateCcw, MapPin } from "lucide-react";
import { submitReport } from "@/services/api";
import { emitReportSubmitted } from "@/services/socket";
import { useAppContext } from "@/context/AppContext";
import { CATEGORIES, WARDS } from "@/mock/constants";
import { getCategoryIcon } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastSuccess, toastError } from "@/lib/toast";

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
    setValue,
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

  useEffect(() => {
    register("ward", { required: "Please select a ward" });
  }, [register]);

  const selectedCategory = watch("category");
  const selectedWard = watch("ward");

  const onSubmit = async (formData) => {
    console.log("ENTER: ReportForm.onSubmit", formData);
    setIsSubmitting(true);
    try {
      const latVal = parseFloat(formData.latitude);
      const lngVal = parseFloat(formData.longitude);
      const trimmedUrl = formData.imageUrl ? formData.imageUrl.trim() : "";

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        ward: formData.ward,
        reportedBy: formData.reportedBy.trim() || "Anonymous Citizen",
        latitude: !isNaN(latVal) ? latVal : DEFAULT_COORDS.latitude,
        longitude: !isNaN(lngVal) ? lngVal : DEFAULT_COORDS.longitude,
        imageUrl: trimmedUrl.length > 0 ? trimmedUrl : null,
      };

      const newReport = await submitReport(payload);
      console.log(`SUCCESS: ReportForm submitted id=${newReport.id}`);

      dispatch({ type: "ADD_REPORT", payload: newReport });
      console.log("STATE_CHANGE: ADD_REPORT dispatched");

      emitReportSubmitted(newReport);
      await loadKpi();

      toastSuccess(`Report #${newReport.id} submitted to the municipality.`);
      setSubmitted(true);
      reset();
      setTimeout(() => {
        console.log("STATE_CHANGE: ReportForm.submitted reset to false");
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      console.error(`ERR-FORM-001: ReportForm.onSubmit failed. ${err.message}`);
      toastError("ERR-FORM-001", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-4">OK</div>
            <h3 className="text-xl font-bold text-white mb-2">Report Submitted Successfully</h3>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Your incident has been logged with the municipality. A reference number has been assigned.
              You will receive updates as the issue progresses.
            </p>
            <p className="text-gray-600 text-xs mt-4">This notice will dismiss automatically</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Report a Municipal Issue</CardTitle>
          <CardDescription>Submit an infrastructure issue for assessment by municipal technicians.</CardDescription>
        </CardHeader>
        <CardContent>
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
                placeholder="Describe the issue in detail location specifics, severity, duration, etc."
              />
              {errors.description && <p className="form-error">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Ward *</label>
                <Select
                  value={selectedWard || ""}
                  onValueChange={(val) => {
                    console.log(`STATE_CHANGE: ReportForm.ward=${val}`);
                    setValue("ward", val, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {WARDS.map((w) => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      {...register("latitude", { required: "Latitude required", validate: (v) => !isNaN(parseFloat(v)) || "Must be a number" })}
                      className="form-input"
                      placeholder="Latitude e.g. -33.9249"
                    />
                    {errors.latitude && <p className="form-error">{errors.latitude.message}</p>}
                  </div>
                  <div>
                    <input
                      {...register("longitude", { required: "Longitude required", validate: (v) => !isNaN(parseFloat(v)) || "Must be a number" })}
                      className="form-input"
                      placeholder="Longitude e.g. 18.4241"
                    />
                    {errors.longitude && <p className="form-error">{errors.longitude.message}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-600 bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-500" />
                  Default: Cape Town CBD (-33.9249, 18.4241) toggle above to specify exact coordinates
                </p>
              )}
            </div>

            <div>
              <label className="form-label">Image Reference (Optional)</label>
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center hover:border-gray-600 transition-colors">
                <p className="text-gray-500 text-sm">Image upload simulation</p>
                <input
                  {...register("imageUrl", {
                    pattern: {
                      value: /^(https?:\/\/.*)?$/,
                      message: "Must be a valid HTTP/HTTPS URL",
                    },
                  })}
                  className="form-input mt-3"
                  placeholder="Paste image URL or leave blank"
                />
                {errors.imageUrl && <p className="form-error mt-1">{errors.imageUrl.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting to Municipality</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Report</>
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  console.log("STATE_CHANGE: ReportForm.reset triggered");
                  reset();
                }}
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}