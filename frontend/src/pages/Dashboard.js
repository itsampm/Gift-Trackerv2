import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Plus, Gift, Calendar, Cake, Moon, Sun, ListChecks } from "lucide-react";
import { toast } from "sonner";
import AddKidModal from "../components/AddKidModal";
import KidCard from "../components/KidCard";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ darkMode, setDarkMode }) {
  const [kids, setKids] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKids();
    fetchReminders();
  }, []);

  const fetchKids = async () => {
    try {
      const response = await axios.get(`${API}/kids`);
      setKids(response.data);
    } catch (error) {
      toast.error("Failed to load kids");
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`${API}/reminders`);
      setReminders(response.data);
    } catch (error) {
      console.error("Failed to load reminders", error);
    }
  };

  const handleKidAdded = () => {
    fetchKids();
    fetchReminders();
  };

  const handleKidDeleted = (kidId) => {
    setKids(kids.filter(k => k.id !== kidId));
    fetchReminders();
  };

  const upcomingBirthdays = reminders.filter(r => r.days_until <= 30);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2" data-testid="dashboard-title">
                Gift Tracker 🎁
              </h1>
              <p className="text-lg text-foreground/70">Keep track of birthday & Christmas gifts for the little ones!</p>
            </div>
            <div className="flex gap-3">
              {/* Dark Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="candy-button bg-secondary text-foreground"
                data-testid="dark-mode-toggle"
              >
                {darkMode ? <Sun className="inline" size={20} /> : <Moon className="inline" size={20} />}
              </motion.button>
              
              {/* Christmas Checklist Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/christmas")}
                className="candy-button bg-success text-white"
                data-testid="christmas-checklist-button"
              >
                <ListChecks className="inline mr-2" size={20} />
                Christmas
              </motion.button>
              
              {/* Add Kid Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="candy-button bg-primary text-white"
                data-testid="add-kid-button"
              >
                <Plus className="inline mr-2" size={20} />
                Add Kid
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Birthdays Banner */}
        {upcomingBirthdays.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticker-card bg-warning/20 mb-8"
            data-testid="upcoming-birthdays-banner"
          >
            <div className="flex items-start gap-4">
              <div className="bg-warning rounded-full p-3 border-2 border-black">
                <Cake size={24} className="text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Upcoming Birthdays! 🎂</h3>
                <div className="space-y-2">
                  {upcomingBirthdays.map(reminder => (
                    <div key={reminder.kid_id} className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span className="font-medium">{reminder.kid_name}</span>
                      <span className="text-sm text-foreground/70">
                        - {reminder.days_until === 0 ? 'Today!' : `in ${reminder.days_until} days`} (turns {reminder.age + 1})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Kids Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        ) : kids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
            data-testid="empty-state"
          >
            <Gift size={64} className="mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">No kids added yet!</h3>
            <p className="text-foreground/70 mb-6">Start by adding a kid to track their gifts</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="candy-button bg-accent text-white"
              data-testid="empty-state-add-button"
            >
              Add Your First Kid
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="kids-grid">
            {kids.map((kid, index) => (
              <KidCard
                key={kid.id}
                kid={kid}
                index={index}
                onDelete={handleKidDeleted}
                onClick={() => navigate(`/kid/${kid.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Kid Modal */}
      {showAddModal && (
        <AddKidModal
          onClose={() => setShowAddModal(false)}
          onKidAdded={handleKidAdded}
        />
      )}
    </div>
  );
}