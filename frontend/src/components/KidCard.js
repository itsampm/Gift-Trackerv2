import { motion } from "framer-motion";
import { Trash2, Calendar, Gift } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useState } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function calculateAge(birthdayStr) {
  const birthday = new Date(birthdayStr);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--;
  }
  return age;
}

function calculateDaysUntilBirthday(birthdayStr) {
  const birthday = new Date(birthdayStr);
  const today = new Date();
  const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
  return daysUntil;
}

export default function KidCard({ kid, index, onDelete, onClick }) {
  const [deleting, setDeleting] = useState(false);
  const age = calculateAge(kid.birthday);
  const daysUntil = calculateDaysUntilBirthday(kid.birthday);
  const birthdayMonth = new Date(kid.birthday).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete ${kid.name}?`)) {
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`${API}/kids/${kid.id}`);
      toast.success(`${kid.name} deleted successfully`);
      onDelete(kid.id);
    } catch (error) {
      toast.error("Failed to delete kid");
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, rotate: -1 }}
      onClick={onClick}
      className="sticker-card cursor-pointer relative overflow-hidden"
      data-testid={`kid-card-${kid.id}`}
    >
      {/* Birthday countdown badge */}
      {daysUntil <= 30 && (
        <div className="absolute top-4 right-4 bg-warning text-black px-3 py-1 rounded-full border-2 border-black text-xs font-bold">
          {daysUntil === 0 ? '🎂 Today!' : `${daysUntil}d`}
        </div>
      )}

      {/* Photo */}
      <div className="w-full h-48 rounded-lg border-2 border-black overflow-hidden mb-4 bg-secondary/20">
        {kid.photo ? (
          <img src={kid.photo} alt={kid.name} className="w-full h-full object-cover" data-testid={`kid-photo-${kid.id}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎈
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1" data-testid={`kid-name-${kid.id}`}>{kid.name}</h3>
            <div className="flex items-center gap-2 text-sm text-foreground/70">
              <Calendar size={16} />
              <span data-testid={`kid-birthday-${kid.id}`}>{birthdayMonth}</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 bg-primary text-white rounded-full border-2 border-black shadow-button hover:translate-y-1 hover:shadow-none transition-all"
            data-testid={`delete-kid-${kid.id}`}
          >
            <Trash2 size={16} />
          </motion.button>
        </div>

        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-accent text-white rounded-full text-sm font-bold border-2 border-black" data-testid={`kid-age-${kid.id}`}>
            Age {age}
          </span>
          <div className="flex items-center gap-2 text-sm text-foreground/70">
            <Gift size={16} />
            <span>View Gifts</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}