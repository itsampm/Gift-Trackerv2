import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Edit, Trash2, Plus, Gift as GiftIcon, Calendar } from "lucide-react";
import { toast } from "sonner";
import AddGiftModal from "../components/AddGiftModal";
import EditKidModal from "../components/EditKidModal";
import GiftCard from "../components/GiftCard";

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

export default function KidProfile() {
  const { kidId } = useParams();
  const navigate = useNavigate();
  const [kid, setKid] = useState(null);
  const [gifts, setGifts] = useState([]);
  const [showAddGiftModal, setShowAddGiftModal] = useState(false);
  const [showEditKidModal, setShowEditKidModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKidData();
    fetchGifts();
  }, [kidId]);

  const fetchKidData = async () => {
    try {
      const response = await axios.get(`${API}/kids/${kidId}`);
      setKid(response.data);
    } catch (error) {
      toast.error("Failed to load kid data");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchGifts = async () => {
    try {
      const response = await axios.get(`${API}/gifts/kid/${kidId}`);
      setGifts(response.data);
    } catch (error) {
      console.error("Failed to load gifts", error);
    }
  };

  const handleDeleteKid = async () => {
    if (!window.confirm(`Are you sure you want to delete ${kid.name}? This will also delete all their gifts.`)) {
      return;
    }
    try {
      await axios.delete(`${API}/kids/${kidId}`);
      toast.success("Kid deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete kid");
    }
  };

  const handleGiftAdded = () => {
    fetchGifts();
  };

  const handleKidUpdated = () => {
    fetchKidData();
  };

  const handleGiftDeleted = (giftId) => {
    setGifts(gifts.filter(g => g.id !== giftId));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!kid) return null;

  const age = calculateAge(kid.birthday);
  const birthdayFormatted = new Date(kid.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 font-medium hover:text-primary transition-colors"
          data-testid="back-button"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </motion.button>

        {/* Kid Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticker-card mb-8"
          data-testid="kid-profile-card"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-lg border-2 border-black overflow-hidden shadow-hard bg-secondary/20">
                {kid.photo ? (
                  <img src={kid.photo} alt={kid.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🎈
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2" data-testid="kid-name">{kid.name}</h1>
                  <div className="flex items-center gap-4 text-lg">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} className="text-primary" />
                      <span data-testid="kid-birthday">{birthdayFormatted}</span>
                    </div>
                    <span className="px-3 py-1 bg-accent text-white rounded-full text-sm font-bold border-2 border-black" data-testid="kid-age">
                      Age {age}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditKidModal(true)}
                    className="p-3 bg-secondary rounded-full border-2 border-black shadow-button hover:translate-y-1 hover:shadow-none transition-all"
                    data-testid="edit-kid-button"
                  >
                    <Edit size={20} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteKid}
                    className="p-3 bg-primary text-white rounded-full border-2 border-black shadow-button hover:translate-y-1 hover:shadow-none transition-all"
                    data-testid="delete-kid-button"
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </div>
              </div>

              {/* Interests/Wishlist */}
              {kid.interests && (
                <div className="bg-success/10 border-2 border-black rounded-lg p-4">
                  <h3 className="text-lg font-bold mb-2">Interests & Wishlist 💚</h3>
                  <p className="whitespace-pre-wrap" data-testid="kid-interests">{kid.interests}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Gifts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold" data-testid="gifts-section-title">Gift History 🎁</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddGiftModal(true)}
              className="candy-button bg-primary text-white"
              data-testid="add-gift-button"
            >
              <Plus className="inline mr-2" size={20} />
              Add Gift
            </motion.button>
          </div>

          {gifts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="sticker-card text-center py-12"
              data-testid="no-gifts-message"
            >
              <GiftIcon size={64} className="mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">No gifts recorded yet!</h3>
              <p className="text-foreground/70 mb-6">Start tracking gifts for birthdays and Christmas</p>
              <button
                onClick={() => setShowAddGiftModal(true)}
                className="candy-button bg-accent text-white"
                data-testid="add-first-gift-button"
              >
                Add First Gift
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="gifts-grid">
              {gifts.map((gift, index) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  index={index}
                  onDelete={handleGiftDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddGiftModal && (
        <AddGiftModal
          kidId={kidId}
          onClose={() => setShowAddGiftModal(false)}
          onGiftAdded={handleGiftAdded}
        />
      )}
      {showEditKidModal && (
        <EditKidModal
          kid={kid}
          onClose={() => setShowEditKidModal(false)}
          onKidUpdated={handleKidUpdated}
        />
      )}
    </div>
  );
}