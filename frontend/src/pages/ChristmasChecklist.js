import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { ArrowLeft, Gift, Check, X } from "lucide-react";
import { toast } from "sonner";

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

export default function ChristmasChecklist() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [kids, setKids] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomYear, setShowCustomYear] = useState(false);
  const [customYearInput, setCustomYearInput] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      const [kidsRes, giftsRes] = await Promise.all([
        axios.get(`${API}/kids`),
        axios.get(`${API}/gifts`)
      ]);
      setKids(kidsRes.data);
      setGifts(giftsRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getChristmasGiftForKid = (kidId) => {
    return gifts.find(g => g.kid_id === kidId && g.occasion === "christmas" && g.year === selectedYear);
  };

  const handleToggleGift = async (kid) => {
    const existingGift = getChristmasGiftForKid(kid.id);
    
    if (existingGift) {
      try {
        await axios.delete(`${API}/gifts/${existingGift.id}`);
        toast.success(`Removed Christmas gift for ${kid.name}`);
        fetchData();
      } catch (error) {
        toast.error("Failed to remove gift");
      }
    } else {
      try {
        await axios.post(`${API}/gifts`, {
          kid_id: kid.id,
          occasion: "christmas",
          year: selectedYear,
          gift_name: "To be decided",
          date_given: ""
        });
        toast.success(`Added Christmas gift for ${kid.name}`);
        fetchData();
      } catch (error) {
        toast.error("Failed to add gift");
      }
    }
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };

  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleCustomYearSubmit = () => {
    const year = parseInt(customYearInput);
    if (year >= 2000 && year <= 2200) {
      setSelectedYear(year);
      setShowCustomYear(false);
      setCustomYearInput("");
    } else {
      toast.error("Please enter a year between 2000 and 2200");
    }
  };

  // Quick access years (commonly used)
  const quickYears = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];

  const kidsWithGifts = kids.map(kid => ({
    ...kid,
    hasGift: !!getChristmasGiftForKid(kid.id),
    gift: getChristmasGiftForKid(kid.id)
  }));

  const completedCount = kidsWithGifts.filter(k => k.hasGift).length;
  const totalCount = kids.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2" data-testid="checklist-title">
                Christmas Checklist 🎄
              </h1>
              <p className="text-lg text-foreground/70">Track who you've bought gifts for</p>
            </div>
            
            {/* Year Navigator */}
            <div className="flex items-center gap-2">
              {/* Previous Year Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrevYear}
                className="p-2 bg-secondary rounded-lg border-2 border-black shadow-button hover:translate-y-1 hover:shadow-none transition-all"
                data-testid="prev-year-button"
              >
                <ArrowLeft size={20} />
              </motion.button>

              {/* Current Year Display */}
              <div className="flex items-center gap-2">
                <div className="chunky-input px-6 py-2 text-center font-bold text-xl min-w-[120px]" data-testid="current-year-display">
                  {selectedYear}
                </div>
                
                {/* Jump to Year Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCustomYear(!showCustomYear)}
                  className="p-2 bg-accent text-white rounded-lg border-2 border-black shadow-button hover:translate-y-1 hover:shadow-none transition-all"
                  data-testid="jump-to-year-button"
                  title="Jump to any year"
                >
                  <Calendar size={20} />
                </motion.button>
              </div>

              {/* Next Year Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNextYear}
                className="p-2 bg-secondary rounded-lg border-2 border-black shadow-button hover:translate-y-1 hover:shadow-none transition-all"
                data-testid="next-year-button"
              >
                <ArrowLeft size={20} className="rotate-180" />
              </motion.button>
            </div>
          </div>

          {/* Custom Year Input */}
          {showCustomYear && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-white border-2 border-black rounded-lg p-4 shadow-hard"
            >
              <div className="flex flex-col gap-3">
                <label className="font-bold text-sm">Jump to Year (2000-2200):</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="2000"
                    max="2200"
                    value={customYearInput}
                    onChange={(e) => setCustomYearInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomYearSubmit()}
                    className="chunky-input flex-1"
                    placeholder="Enter year (e.g., 2050)"
                    data-testid="custom-year-input"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCustomYearSubmit}
                    className="candy-button bg-primary text-white"
                    data-testid="submit-custom-year"
                  >
                    Go
                  </motion.button>
                </div>
                
                {/* Quick Year Shortcuts */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-foreground/70">Quick jump:</span>
                  {quickYears.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        setSelectedYear(year);
                        setShowCustomYear(false);
                      }}
                      className="px-3 py-1 bg-secondary/50 border-2 border-black rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                      data-testid={`quick-year-${year}`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Bar */}
          <div className="bg-white border-2 border-black rounded-lg p-4 shadow-hard">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">Progress</span>
              <span className="text-sm font-medium">{completedCount} of {totalCount} completed</span>
            </div>
            <div className="w-full bg-foreground/10 rounded-full h-4 border-2 border-black overflow-hidden">
              <div 
                className="bg-success h-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Checklist */}
        <div className="space-y-3" data-testid="checklist-items">
          {kidsWithGifts.map((kid, index) => {
            const age = calculateAge(kid.birthday);
            return (
              <motion.div
                key={kid.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white border-2 border-black rounded-lg p-4 shadow-hard transition-all ${
                  kid.hasGift ? 'opacity-75' : ''
                }`}
                data-testid={`checklist-item-${kid.id}`}
              >
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleGift(kid)}
                    className={`w-8 h-8 rounded-lg border-2 border-black flex items-center justify-center transition-colors ${
                      kid.hasGift ? 'bg-success' : 'bg-white hover:bg-foreground/5'
                    }`}
                    data-testid={`checkbox-${kid.id}`}
                  >
                    {kid.hasGift && <Check size={20} className="text-white" />}
                  </motion.button>

                  {/* Kid Info */}
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => navigate(`/kid/${kid.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <h3 className={`text-lg font-bold ${
                        kid.hasGift ? 'line-through text-foreground/50' : ''
                      }`} data-testid={`kid-name-${kid.id}`}>
                        {kid.name}
                      </h3>
                      <span className="px-2 py-0.5 bg-accent text-white rounded-full text-xs font-bold border border-black">
                        Age {age}
                      </span>
                    </div>
                    {kid.gift && kid.gift.gift_name !== "To be decided" && (
                      <p className="text-sm text-foreground/70 mt-1">
                        Gift: {kid.gift.gift_name}
                      </p>
                    )}
                  </div>

                  {/* View Details */}
                  <button
                    onClick={() => navigate(`/kid/${kid.id}`)}
                    className="text-sm text-accent hover:underline"
                    data-testid={`view-details-${kid.id}`}
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {kids.length === 0 && (
          <div className="text-center py-12">
            <Gift size={64} className="mx-auto mb-4 text-primary" />
            <h3 className="text-2xl font-bold mb-2">No kids added yet!</h3>
            <p className="text-foreground/70">Add kids to start your Christmas checklist</p>
          </div>
        )}
      </div>
    </div>
  );
}