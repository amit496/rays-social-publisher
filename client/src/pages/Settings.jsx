import { useEffect, useState } from "react";
import {
  Camera,
  Clock,
  Globe,
  Save,
  Settings as SettingsIcon,
  KeyRound,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

const STORAGE_KEY = "rays-publishing-preferences";

const defaultPreferences = {
  postingTime: "09:00",
  timezone: "Asia/Kolkata",
  autoSave: true,
  notifications: true
};

export default function Settings() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const storedPreferences = localStorage.getItem(STORAGE_KEY);

      if (storedPreferences) {
        setPreferences({
          ...defaultPreferences,
          ...JSON.parse(storedPreferences)
        });
      }
    } catch (error) {
      console.error("Failed to load preferences:", error);
    }
  }, []);

  const handleChange = (field, value) => {
    setPreferences((previous) => ({
      ...previous,
      [field]: value
    }));

    setSaved(false);
  };

  const handleSave = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(preferences)
      );

      setSaved(true);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      alert("Settings save nahi ho paayi. Please try again.");
    }
  };

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="sidebar-label">PREFERENCES</span>
          <h1>Settings</h1>
          <p>Manage your account and publishing preferences.</p>
        </div>

        <div className="settings-heading-icon">
          <SettingsIcon size={25} />
        </div>
      </div>

      <div className="settings-layout">
        {/* Instagram Account */}
        <section className="panel settings-section">
          <div className="settings-section-heading">
            <div className="settings-icon">
              <Camera size={23} color="#c5ff45" />
            </div>

            <div>
              <h2>Instagram Account</h2>
              <p>Connect your Instagram Professional account.</p>
            </div>
          </div>

          <div className="settings-account-card">
            <div className="settings-account-info">
              <div className="settings-account-avatar">
                <Camera size={22} />
              </div>

              <div>
                <h3>Instagram</h3>
                <p>Account not connected</p>
              </div>
            </div>

            <span className="settings-status pending">
              Not Connected
            </span>
          </div>

          <div className="settings-notice">
            <AlertCircle size={18} />
            <p>
              Instagram connection is not implemented yet.
              Meta Developer App and API authorization setup
              will be required.
            </p>
          </div>

          <button
            type="button"
            className="settings-connect-btn"
            disabled
          >
            <Camera size={16} />
            Connect Instagram
          </button>
        </section>

        {/* Meta API Configuration */}
        <section className="panel settings-section">
          <div className="settings-section-heading">
            <div className="settings-icon">
              <KeyRound size={23} color="#c5ff45" />
            </div>

            <div>
              <h2>Meta API Configuration</h2>
              <p>Requirements for Instagram publishing integration.</p>
            </div>
          </div>

          <div className="settings-checklist">
            <div className="settings-check-item">
              <span>Meta Developer App</span>
              <span className="settings-status pending">Pending</span>
            </div>

            <div className="settings-check-item">
              <span>Instagram Professional Account</span>
              <span className="settings-status pending">Pending</span>
            </div>

            <div className="settings-check-item">
              <span>Facebook Page Connection</span>
              <span className="settings-status pending">Pending</span>
            </div>

            <div className="settings-check-item">
              <span>API Authorization</span>
              <span className="settings-status pending">Pending</span>
            </div>
          </div>

          <div className="settings-notice">
            <AlertCircle size={18} />
            <p>
              API credentials and Instagram account authorization
              have not been configured yet. Do not enter or store
              access tokens in this frontend page.
            </p>
          </div>
        </section>

        {/* Publishing Preferences */}
        <section className="panel settings-section">
          <div className="settings-section-heading">
            <div className="settings-icon">
              <Clock size={23} color="#c5ff45" />
            </div>

            <div>
              <h2>Publishing Preferences</h2>
              <p>Set your preferred publishing time and timezone.</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="settings-field">
              <label htmlFor="postingTime">
                Default Posting Time
              </label>

              <div className="settings-input-wrapper">
                <Clock size={17} />

                <input
                  id="postingTime"
                  type="time"
                  value={preferences.postingTime}
                  onChange={(event) =>
                    handleChange("postingTime", event.target.value)
                  }
                />
              </div>

              <small>
                Preferred time for future scheduled posts.
              </small>
            </div>

            <div className="settings-field">
              <label htmlFor="timezone">
                Timezone
              </label>

              <div className="settings-input-wrapper">
                <Globe size={17} />

                <select
                  id="timezone"
                  value={preferences.timezone}
                  onChange={(event) =>
                    handleChange("timezone", event.target.value)
                  }
                >
                  <option value="Asia/Kolkata">
                    India Standard Time (IST)
                  </option>

                  <option value="UTC">
                    Coordinated Universal Time (UTC)
                  </option>

                  <option value="America/New_York">
                    Eastern Time (ET)
                  </option>

                  <option value="Europe/London">
                    London Time
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-toggle-list">
            <label className="settings-toggle-row">
              <div>
                <strong>Auto Save Preferences</strong>
                <small>Save preference changes locally when you click Save.</small>
              </div>

              <input
                type="checkbox"
                checked={preferences.autoSave}
                onChange={(event) =>
                  handleChange("autoSave", event.target.checked)
                }
              />
            </label>

            <label className="settings-toggle-row">
              <div>
                <strong>Notifications</strong>
                <small>Notification preference for future app features.</small>
              </div>

              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(event) =>
                  handleChange("notifications", event.target.checked)
                }
              />
            </label>
          </div>

          <div className="settings-save-row">
            {saved && (
              <span className="settings-saved-message">
                <CheckCircle2 size={17} />
                Preferences saved
              </span>
            )}

            <button
              type="button"
              className="settings-save-btn"
              onClick={handleSave}
            >
              <Save size={17} />
              Save Preferences
            </button>
          </div>
        </section>

        {/* Application Information */}
        <section className="panel settings-section">
          <div className="settings-section-heading">
            <div className="settings-icon">
              <SettingsIcon size={23} color="#c5ff45" />
            </div>

            <div>
              <h2>Application Information</h2>
              <p>RAYS TechLab Social Publisher details.</p>
            </div>
          </div>

          <div className="settings-info-list">
            <div>
              <span>Application</span>
              <strong>RAYS Social Publisher</strong>
            </div>

            <div>
              <span>Brand</span>
              <strong>RAYS TechLab</strong>
            </div>

            <div>
              <span>Version</span>
              <strong>1.0.0</strong>
            </div>

            <div>
              <span>Publishing Integration</span>
              <strong>Not Configured</strong>
            </div>
          </div>

          <p className="settings-brand-note">
            Made at RAYS TechLab
          </p>
        </section>
      </div>
    </div>
  );
}