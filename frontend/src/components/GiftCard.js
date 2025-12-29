import { motion } from "framer-motion";
import { Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function GiftCard({ gift, index, onDelete }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete this gift?`)) {
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`${API}/gifts/${gift.id}`);
      toast.success("Gift deleted successfully");
      onDelete(gift.id);
    } catch (error) {
      toast.error("Failed to delete gift");
      setDeleting(false);
    }
  };

  const occasionColor = gift.occasion === "birthday" ? "bg-primary" : "bg-success";
  const occasionEmoji = gift.occasion === "birthday" ? "🎂" : "🎄";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="sticker-card relative"
      data-testid={`gift-card-${gift.id}`}
    >
      {/* Occasion Badge */}
      <div className={`absolute top-4 right-4 ${occasionColor} text-white px-3 py-1 rounded-full border-2 border-black text-xs font-bold`}>
        {occasionEmoji} {gift.occasion === "birthday" ? "Birthday" : "Christmas"} {gift.year}
      </div>

      {/* Photo */}
      <div className="w-full h-48 rounded-lg border-2 border-black overflow-hidden mb-4 bg-secondary/20">
        {gift.photo ? (
          <img src={gift.photo} alt={gift.gift_name} className="w-full h-full object-cover" data-testid={`gift-photo-${gift.id}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎁
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold mb-1 truncate" data-testid={`gift-name-${gift.id}`}>{gift.gift_name}</h3>
            {gift.date_given && (
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Calendar size={16} />
                <span data-testid={`gift-date-${gift.id}`}>{new Date(gift.date_given).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 bg-primary text-white rounded-full border-2 border-black shadow-button hover:translate-y-1 hover:shadow-none transition-all flex-shrink-0"
            data-testid={`delete-gift-${gift.id}`}
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}