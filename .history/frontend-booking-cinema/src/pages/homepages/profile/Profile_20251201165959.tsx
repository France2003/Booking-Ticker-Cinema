import React, { useEffect, useState } from "react";
import { getMyBookings, getProfile, updateProfile } from "../../../services/userProfile/userProfile";
import type { UserProfile, UpdateProfileData } from "../../../types/userProfile/useProfile";
import ProfileForm from "./ProfileForm";
import BookingHistory from "./BookingHistory";
import { Helmet } from "react-helmet";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);
  useEffect(() => {
    const load = async () => {
      const result = await getMyBookings();
      setHistory(result);
    };
    load();
  }, []);
  const handleUpdate = async (data: UpdateProfileData) => {
    try {
      const updated = await updateProfile(data);
      setProfile(updated);
    } catch (error) {
      console.error(error);
    }
  };
  if (loading) return <div className="text-center mt-10">Đang tải thông tin...</div>;
  if (!profile) return <div className="text-center mt-10">Không tìm thấy thông tin người dùng</div>;

  return (
    <div className="max-w-4xl mx-auto mt-16 bg-white shadow-md rounded-2xl p-6 text-gray-800">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Trang cá nhân {profile.fullname}</title>
      </Helmet>
      <h1 className="text-3xl font-bold mb-6 text-center">Trang cá nhân</h1>
      <ProfileForm profile={profile} onUpdate={handleUpdate} />
      <BookingHistory bookings={history} />
    </div>
  );
};

export default Profile;
