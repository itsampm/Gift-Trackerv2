import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function EditKidModal({ kid, onClose, onKidUpdated }) {
  const [formData, setFormData] = useState({
    name: kid.name,
    birthday: kid.birthday,
    photo: kid.photo || "",
    interests: kid.interests || "",
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
    if (!formData.name || !formData.birthday) {
      toast.error("Name and birthday are required");
      return;
    }

    setSubmitting(true);
    try {
      await axios.put(`${API}/kids/${kid.id}`, formData);
      toast.success(`${formData.name} updated successfully! ✨`);
      onKidUpdated();
      onClose();
    } catch (error) {
      toast.error("Failed to update kid");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="sticker-card max-w-md w-full max-h-[90vh] overflow-y-auto"
          data-testid="edit-kid-modal"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Edit {kid.name} ✏️</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-foreground/10 rounded-lg transition-colors"
              data-testid="close-edit-modal-button"
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
                    <img src={formData.photo} alt="Preview" className="w-full h-full object-cover" data-testid="edit-photo-preview" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer">
                  <div className="chunky-input flex items-center justify-center gap-2 hover:bg-foreground/5 transition-colors">
                    <Upload size={20} />
                    <span>{uploading ? "Uploading..." : "Change Photo"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploading}
                    className="hidden"
                    data-testid="edit-photo-upload-input"
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-bold mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="chunky-input w-full"
                required
                data-testid="edit-name-input"
              />
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-bold mb-2">Birthday *</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="chunky-input w-full"
                required
                data-testid="edit-birthday-input"
              />
            </div>

            {/* Interests/Wishlist */}
            <div>
              <label className="block text-sm font-bold mb-2">Interests & Wishlist (optional)</label>
              <textarea
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                className="chunky-input w-full h-24 resize-none"
                data-testid="edit-interests-input"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="candy-button bg-primary text-white w-full"
              data-testid="submit-edit-kid-button"
            >
              {submitting ? "Saving..." : "Save Changes ✨"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}