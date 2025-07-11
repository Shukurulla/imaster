"use client";

import { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Avatar, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit, FiUser } from "react-icons/fi";
import { setTheme, setFontSize } from "../store/slices/settingsSlice";
import api, { authAPI } from "../services/api";

const SettingsPage = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileForm] = Form.useForm();

  const dispatch = useDispatch();

  // Get data from Redux store
  const { user } = useSelector((state) => state.auth);
  const { theme, fontSize } = useSelector((state) => state.settings);

  // Use user data from Redux instead of separate API call
  useEffect(() => {
    const profile = async () => {
      const { data } = await authAPI.getProfile();
      console.log(data);

      setProfileData(data);
    };
    profile();
  }, []);
  useEffect(() => {
    if (user) {
      setProfileData(user);
      profileForm.setFieldsValue({
        username: user.username || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  }, [user, profileForm]);

  const handleThemeChange = (value) => {
    dispatch(setTheme(value));
    message.success(
      `Тема изменена на ${
        value === "dark"
          ? "тёмную"
          : value === "light"
          ? "светлую"
          : "системную"
      }`
    );
  };

  const handleFontSizeChange = (value) => {
    dispatch(setFontSize(value));
    document.body.classList.add(`font-${value}`);
    message.success("Шрифт изменен");
  };

  const handleProfileUpdate = async (values) => {
    if (!profileData) return;

    setLoading(true);
    try {
      const response = await api.patch(
        `/user/users/${profileData.id}/`,
        values
      );
      console.log(response);

      // Update local state with new data
      setProfileData(response.data);

      message.success("Профиль успешно обновлен!");
      setEditMode(false);
    } catch (error) {
      console.error("Profile update error:", error);
      message.error("Ошибка при обновлении профиля");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Reset form to original values when canceling edit
      profileForm.setFieldsValue({
        username: profileData?.username || "",
        first_name: profileData?.first_name || "",
        last_name: profileData?.last_name || "",
        email: profileData?.email || "",
        phone_number: profileData?.phone_number || "",
      });
    }
    setEditMode(!editMode);
  };

  const themeOptions = [
    { label: "Светлый", value: "light" },
    { label: "Системный", value: "system" },
    { label: "Тёмный", value: "dark" },
  ];

  const fontOptions = [
    { label: "SF Pro Display", value: "sf-pro" },
    { label: "Inter", value: "inter" },
    { label: "Roboto", value: "roboto" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      {!profileData ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <Card
          title="Профиль пользователя"
          className="shadow-sm"
          extra={
            <Button type="primary" icon={<FiEdit />} onClick={handleEditToggle}>
              {editMode ? "Отмена" : "Редактировать"}
            </Button>
          }
        >
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileUpdate}
          >
            <div className="flex items-start space-x-6 mb-6">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <Form.Item
                  label="Имя пользователя"
                  name="username"
                  rules={[
                    { required: true, message: "Введите имя пользователя!" },
                  ]}
                >
                  <Input
                    placeholder={profileData.username}
                    disabled={!editMode}
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { type: "email", message: "Введите корректный email!" },
                  ]}
                >
                  <Input placeholder={profileData.email} disabled={!editMode} />
                </Form.Item>

                <Form.Item label="Имя" name="first_name">
                  <Input
                    placeholder={profileData.first_name}
                    disabled={!editMode}
                  />
                </Form.Item>

                <Form.Item label="Фамилия" name="last_name">
                  <Input
                    placeholder={profileData.last_name}
                    disabled={!editMode}
                  />
                </Form.Item>

                <Form.Item label="Телефон" name="phone_number">
                  <Input
                    placeholder={profileData.phone_number}
                    disabled={!editMode}
                  />
                </Form.Item>

                <Form.Item label="Роль">
                  <Input
                    value={
                      profileData?.role_display ||
                      profileData?.role ||
                      "Пользователь"
                    }
                    disabled
                  />
                </Form.Item>
              </div>
            </div>

            {editMode && (
              <div className="flex justify-end space-x-2">
                <Button onClick={handleEditToggle}>Отмена</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Сохранить изменения
                </Button>
              </div>
            )}
          </Form>
        </Card>
      )}

      {/* Theme Settings */}
      <Card title="Цветовой режим" className="shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <div
              key={option.value}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                theme === option.value
                  ? "border-indigo-500 "
                  : " hover:border-gray-300"
              }`}
              style={{
                background:
                  option.value === "system"
                    ? "linear-gradient(to right, white 50%, rgb(26, 26, 26) 50%)"
                    : option.value === "light"
                    ? "#fff"
                    : option.value === "dark"
                    ? "#000"
                    : "#fff",
              }}
              onClick={() => handleThemeChange(option.value)}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">iM</span>
                  </div>
                </div>
                {option.value === "system" && (
                  <span className="text-sm  font-medium flex justify-center">
                    <span className="text-black">
                      {option.label.slice(0, 4)}
                    </span>
                    <span className="text-white letter-space-2">
                      {option.label.slice(4, 8)}
                    </span>
                  </span>
                )}
                {option.value === "light" && (
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#000" }}
                  >
                    {option.label}
                  </span>
                )}
                {option.value === "dark" && (
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#fff" }}
                  >
                    {option.label}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Font Settings */}
      <Card title="Шрифт" className="shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          {fontOptions.map((option) => (
            <div
              key={option.value}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                fontSize === option.value
                  ? "border-indigo-500 "
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleFontSizeChange(option.value)}
            >
              <div className="text-center">
                <div
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily:
                      option.value === "sf-pro"
                        ? "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                        : option.value === "inter"
                        ? "'Inter', system-ui, sans-serif"
                        : "'Roboto', system-ui, sans-serif",
                  }}
                >
                  Aa
                </div>

                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-indigo-600">
          Текущий шрифт: {fontOptions.find((f) => f.value === fontSize)?.label}
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
