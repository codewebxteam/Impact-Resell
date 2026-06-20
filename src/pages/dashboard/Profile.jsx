import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Loader2,
  Shield,
  CreditCard,
  Bell,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Download,
  Plus,
  Trash2,
  AlertTriangle,
  Smartphone,
  Laptop,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from "firebase/auth";
import { db } from "../../firebase/config";

const Profile = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);
  const bioRef = useRef(null);

  // Password fields
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Delete Account State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  // Notification State
  const [notifications, setNotifications] = useState({
    emailCourse: true,
    emailPromos: false,
    securityAlerts: true,
    smsAlerts: false,
  });

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    website: "",
    github: "",
    twitter: "",
    linkedin: "",
    photoURL: ""
  });

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            name: data.name || currentUser.displayName || "",
            email: currentUser.email || "",
            phone: data.phone || "",
            location: data.location || "",
            bio: data.bio || "",
            website: data.website || "",
            github: data.github || "",
            twitter: data.twitter || "",
            linkedin: data.linkedin || "",
            photoURL: data.photoURL || currentUser.photoURL || ""
          });
          setNotifications(data.notifications || notifications);
        } else {
          // Initialize with current user data
          setFormData(prev => ({
            ...prev,
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            photoURL: currentUser.photoURL || ""
          }));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    loadUserData();
  }, [currentUser]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Get updated bio from textarea
      const updatedBio = bioRef.current?.value || formData.bio;
      
      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: formData.name
      });

      // Update Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        bio: updatedBio,
        website: formData.website,
        github: formData.github,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        photoURL: formData.photoURL,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setFormData(prev => ({ ...prev, bio: updatedBio }));
      setIsEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Failed to update profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Image size should be less than 5MB!");
      return;
    }

    setLoading(true);
    try {
      // Compress and resize image
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to max 800x800 while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.7 quality)
        const base64String = canvas.toDataURL('image/jpeg', 0.7);
        
        // Check if compressed size is still too large
        if (base64String.length > 900000) {
          alert("❌ Image is too large even after compression. Please use a smaller image!");
          setLoading(false);
          return;
        }
        
        // Only update Firestore (not Firebase Auth)
        await updateDoc(doc(db, "users", currentUser.uid), { 
          photoURL: base64String 
        });

        console.log("✅ Image saved to Firestore!", base64String.substring(0, 50) + "...");
        setFormData(prev => ({ ...prev, photoURL: base64String }));
        alert("✅ Profile picture updated!");
        setLoading(false);
      };
      
      img.onerror = () => {
        alert("❌ Failed to load image!");
        setLoading(false);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("❌ Failed to update profile picture: " + error.message);
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      alert("❌ New passwords don't match!");
      return;
    }

    if (passwords.new.length < 6) {
      alert("❌ Password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwords.current
      );
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, passwords.new);
      
      setPasswords({ current: "", new: "", confirm: "" });
      alert("✅ Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.code === "auth/wrong-password") {
        alert("❌ Current password is incorrect!");
      } else {
        alert("❌ Failed to update password: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== formData.email) {
      alert("❌ Email does not match!");
      return;
    }

    setLoading(true);
    try {
      await deleteUser(currentUser);
      alert("✅ Account deleted successfully!");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("❌ Failed to delete account: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = async (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    
    try {
      await updateDoc(doc(db, "users", currentUser.uid), {
        notifications: updated
      });
    } catch (error) {
      console.error("Error updating notifications:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 pb-10">
      {/* --- HEADER SECTION --- */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="h-48 md:h-64 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-[#0891b2] to-slate-900 opacity-80" />
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#5edff4]/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 font-bold text-9xl tracking-widest select-none">
            PROFILE
          </div>
          <button className="absolute top-6 right-6 px-4 py-2 bg-black/30 backdrop-blur-md border border-white/20 text-white rounded-xl text-xs font-bold hover:bg-black/50 transition-all flex items-center gap-2 cursor-pointer">
            <Camera className="size-4" /> Change Cover
          </button>
        </div>

        <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-center gap-6 -mt-16 md:-mt-12 relative z-10">
          <div className="relative group">
            <div className="size-32 md:size-40 rounded-[2rem] bg-white p-2 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <img
                src={formData.photoURL || `https://ui-avatars.com/api/?name=${formData.name}&background=0f172a&color=5edff4&bold=true`}
                alt="Profile"
                className="size-full rounded-[1.5rem] object-cover bg-slate-100"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="absolute bottom-2 right-2 p-3 bg-[#5edff4] text-slate-900 rounded-xl shadow-lg hover:scale-110 transition-transform border-2 border-white cursor-pointer disabled:opacity-50"
            >
              <Camera className="size-5" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left mt-4 md:mt-12">
            <h1 className="text-3xl font-bold text-slate-900">
              {formData.name}
            </h1>
            <p className="text-slate-500 font-medium">Senior Student</p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="size-3" /> {formData.location}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="size-3" /> IST (UTC+05:30)
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-4 md:mt-12 w-full md:w-auto">
            {activeTab === "personal" &&
              (isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 md:flex-none py-3 px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-[#5edff4] hover:text-slate-900 transition-all shadow-lg flex items-center justify-center gap-2 min-w-[140px] cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin size-5" />
                    ) : (
                      <>
                        <Save className="size-5" /> Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 md:flex-none py-3 px-8 rounded-xl bg-slate-900 text-white font-bold hover:bg-[#5edff4] hover:text-slate-900 transition-all shadow-lg shadow-slate-900/20 cursor-pointer"
                >
                  Edit Profile
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid lg:grid-cols-4 gap-8">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
            <nav className="space-y-1">
              <TabButton
                active={activeTab === "personal"}
                onClick={() => setActiveTab("personal")}
                icon={User}
                label="Personal Details"
              />
              <TabButton
                active={activeTab === "security"}
                onClick={() => setActiveTab("security")}
                icon={Shield}
                label="Login & Security"
              />
            </nav>
          </div>

          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-16 bg-[#5edff4]/10 rounded-full blur-2xl" />
            <h3 className="font-bold text-lg mb-2 relative z-10">
              Profile Strength
            </h3>
            <div className="flex items-end gap-2 mb-2 relative z-10">
              <span className="text-4xl font-bold text-[#5edff4]">85%</span>
              <span className="text-slate-400 text-sm mb-1">Completed</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4 relative z-10">
              <div className="h-full w-[85%] bg-[#5edff4] rounded-full" />
            </div>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-colors relative z-10 cursor-pointer">
              Complete Now
            </button>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm"
            >
              {/* === TAB 1: PERSONAL === */}
              {activeTab === "personal" && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Personal Information
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Update your personal details here.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <InputGroup
                      label="Full Name"
                      value={formData.name}
                      icon={User}
                      isEditing={isEditing}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                    <InputGroup
                      label="Email Address"
                      value={formData.email}
                      icon={Mail}
                      isEditing={false}
                      disabled
                    />
                    <InputGroup
                      label="Phone Number"
                      value={formData.phone}
                      icon={Phone}
                      isEditing={isEditing}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                    <InputGroup
                      label="Location"
                      value={formData.location}
                      icon={MapPin}
                      isEditing={isEditing}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wide ml-1">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        ref={bioRef}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#5edff4] focus:ring-1 focus:ring-[#5edff4] outline-none min-h-[120px] font-medium text-slate-700 resize-none transition-all"
                        defaultValue={formData.bio}
                      />
                    ) : (
                      <p className="p-4 bg-slate-50 rounded-2xl text-slate-600 leading-relaxed border border-transparent">
                        {formData.bio || "No bio added yet."}
                      </p>
                    )},
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">
                      Social Profiles
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputGroup
                        label="Website"
                        value={formData.website}
                        icon={Globe}
                        isEditing={isEditing}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                      />
                      <InputGroup
                        label="GitHub"
                        value={formData.github}
                        icon={Github}
                        isEditing={isEditing}
                        onChange={(e) => handleInputChange('github', e.target.value)}
                      />
                      <InputGroup
                        label="Twitter (X)"
                        value={formData.twitter}
                        icon={Twitter}
                        isEditing={isEditing}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                      />
                      <InputGroup
                        label="LinkedIn"
                        value={formData.linkedin}
                        icon={Linkedin}
                        isEditing={isEditing}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === TAB 2: LOGIN & SECURITY === */}
              {activeTab === "security" && (
                <div className="space-y-10">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Login & Security
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Manage your password settings.
                    </p>
                  </div>

                  {/* Change Password Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                        <Lock className="size-5" />
                      </div>
                      <h3 className="font-bold text-slate-900">
                        Change Password
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <InputGroup
                        label="Current Password"
                        value={passwords.current}
                        icon={Lock}
                        isEditing={true}
                        type="password"
                        placeholder="Enter current password"
                        onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                      />
                      <div className="hidden md:block"></div>
                      <InputGroup
                        label="New Password"
                        value={passwords.new}
                        placeholder="Enter new password"
                        icon={Lock}
                        isEditing={true}
                        type="password"
                        onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                      />
                      <InputGroup
                        label="Confirm Password"
                        value={passwords.confirm}
                        placeholder="Confirm new password"
                        icon={Lock}
                        isEditing={true}
                        type="password"
                        onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button 
                        onClick={handlePasswordChange}
                        disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}
                        className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-[#5edff4] hover:text-slate-900 transition-all shadow-lg text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? <Loader2 className="animate-spin size-4" /> : null}
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 w-full" />

                  {/* DANGER ZONE - DELETE ACCOUNT */}
                  <div
                    className={`p-6 border rounded-2xl transition-all duration-300 ${
                      showDeleteConfirm
                        ? "bg-red-50 border-red-200"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    {!showDeleteConfirm ? (
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-red-600 mb-1 flex items-center gap-2">
                            <Trash2 className="size-4" /> Delete Account
                          </h4>
                          <p className="text-xs text-slate-500">
                            Permanently delete your account and all data.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all text-sm shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Delete Account
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                          <AlertTriangle className="size-5" />
                          <h4 className="font-bold">
                            Are you absolutely sure?
                          </h4>
                        </div>
                        <p className="text-sm text-slate-600">
                          This action cannot be undone. Please type{" "}
                          <span className="font-bold select-all">
                            {formData.email}
                          </span>{" "}
                          to confirm.
                        </p>
                        <input
                          type="text"
                          value={deleteInput}
                          onChange={(e) => setDeleteInput(e.target.value)}
                          placeholder={formData.email}
                          className="w-full px-4 py-3 rounded-xl border border-red-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 text-sm font-bold text-slate-700"
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowDeleteConfirm(false);
                              setDeleteInput("");
                            }}
                            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteInput !== formData.email}
                            className={`px-5 py-2.5 font-bold rounded-xl transition-all text-sm shadow-sm cursor-pointer flex items-center gap-2
                                                ${
                                                  deleteInput === formData.email
                                                    ? "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20"
                                                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                                }`}
                          >
                            <Trash2 className="size-4" /> Permanently Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 cursor-pointer
        ${
          active
            ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-[1.02]"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        }`}
  >
    <Icon
      className={`size-5 ${active ? "text-[#5edff4]" : "text-slate-400"}`}
    />
    {label}
    {active && (
      <motion.div
        layoutId="active-pill"
        className="ml-auto size-2 rounded-full bg-[#5edff4]"
      />
    )}
  </button>
);
const InputGroup = ({
  label,
  value,
  icon: Icon,
  isEditing,
  disabled,
  type = "text",
  placeholder,
  onChange
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-2 group">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1 group-focus-within:text-[#0891b2] transition-colors">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Icon
            className={`size-5 ${
              isEditing
                ? "text-slate-400 group-focus-within:text-[#5edff4]"
                : "text-slate-300"
            }`}
          />
        </div>
        <input
          type={currentType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={!isEditing || disabled}
          className={`w-full pl-12 pr-12 py-3.5 rounded-xl outline-none font-bold text-slate-700 transition-all
                    ${
                      isEditing
                        ? "bg-slate-50 border border-slate-200 focus:border-[#5edff4] focus:ring-4 focus:ring-[#5edff4]/10 focus:bg-white shadow-sm"
                        : "bg-transparent border border-transparent"
                    } ${disabled && "opacity-60 cursor-not-allowed"}`}
        />
        {isPassword && isEditing && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
