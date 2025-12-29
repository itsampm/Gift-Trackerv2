import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AddGiftModal({ kidId, onClose, onGiftAdded }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    kid_id: kidId,
    occasion: "birthday",
    year: currentYear,
    gift_name: "",
    photo: "",
    date_given: "",
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(`${API}/upload`, formData);
      setFormData(prev => ({ ...prev, photo: response.data.data }));
      toast.success("Photo uploaded!");
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gift_name) {
      toast.error("Gift name is required");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API}/gifts`, formData);
      toast.success("Gift added successfully! 🎁");
      onGiftAdded();
      onClose();
    } catch (error) {
      toast.error("Failed to add gift");
    } finally {
      setSubmitting(false);
    }
  };

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="sticker-card max-w-md w-full max-h-[90vh] overflow-y-auto"
          data-testid="add-gift-modal"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Add Gift 🎁</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
              data-testid="close-gift-modal-button"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-bold mb-2">Photo (optional)</label>
              <div className="flex items-center gap-4">
                {formData.photo && (
                  <div className="w-24 h-24 rounded-lg border-2 border-black overflow-hidden">
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" data-testid="gift-photo-preview" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="chunky-input flex items-center justify-center gap-2 hover:bg-foreground/5 transition-colors">
                    <Upload size={20} />
                    <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                    data-testid="gift-photo-upload-input"
                  />
                </label>
              </div>
            </div>

            {/* Gift Name */}
            <div>
              <label className="block text-sm font-bold mb-2">Gift Name *</label>
              <input
                type="text"
                value={formData.gift_name}
                onChange={(e) => setFormData({ ...formData, gift_name: e.target.value })}
                className="chunky-input w-full"
                placeholder="What did you give?"
                required
                data-testid="gift-name-input"
              />
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-sm font-bold mb-2">Occasion *</label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="occasion"
                    value="birthday"
                    checked={formData.occasion === "birthday"}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="hidden"
                    data-testid="occasion-birthday"
                  />
                  <div className={`chunky-input text-center ${formData.occasion === "birthday" ? "bg-primary text-white" : ""}`}>
                    🎂 Birthday
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="occasion"
                    value="christmas"
                    checked={formData.occasion === "christmas"}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    className="hidden"
                    data-testid="occasion-christmas"
                  />
                  <div className={`chunky-input text-center ${formData.occasion === "christmas" ? "bg-success text-white" : ""}`}>
                    🎄 Christmas
                  </div>
                </label>
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-bold mb-2">Year *</label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="chunky-input w-full"
                data-testid="gift-year-select"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Date Given */}
            <div>
              <label className="block text-sm font-bold mb-2">Date Given (optional)</label>
              <input
                type="date"
                value={formData.date_given}
                onChange={(e) => setFormData({ ...formData, date_given: e.target.value })}
                className="chunky-input w-full"
                data-testid="gift-date-input"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="candy-button bg-primary text-white w-full"
              data-testid="submit-gift-button"
            >
              {submitting ? "Adding..." : "Add Gift 🎁"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}