import { useEffect, useState } from "react";
import {
  Camera,
  Clock,
  Globe,
  Save,
  Settings as SettingsIcon,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowUpRight
} from "lucide-react";

const STORAGE_KEY = "rays-publishing-preferences";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const META_APP_ID = import.meta.env.VITE_META_APP_ID;
const META_CONFIG_ID = import.meta.env.VITE_META_CONFIG_ID;
const GRAPH_VERSION =
  import.meta.env.VITE_META_GRAPH_VERSION || "v25.0";

const defaultPreferences = {
  postingTime: "09:00",
  timezone: "Asia/Kolkata",
  autoSave: true,
  notifications: true
};

export default function Settings() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [saved, setSaved] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [connectionError, setConnectionError] = useState(false);

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


const connectInstagram = () => {
  if (!META_APP_ID || !META_CONFIG_ID) {
    setConnectionError(true);
    setConnectionMessage(
      "Meta App ID ya Configuration ID missing hai."
    );
    return;
  }

  if (!window.FB) {
    setConnectionError(true);
    setConnectionMessage(
      "Meta SDK load nahi hua. Page refresh karke dobara try karein."
    );
    return;
  }

  setConnecting(true);
  setConnectionMessage("");
  setConnectionError(false);

  window.FB.init({
    appId: META_APP_ID,
    autoLogAppEvents: true,
    xfbml: true,
    version: GRAPH_VERSION
  });

  window.FB.login(
    function (response) {
      (async () => {
        try {
          const code = response.authResponse?.code;

          if (!code) {
            throw new Error(
              "Instagram authorization complete nahi hua."
            );
          }

          const result = await fetch(
            `${API_URL}/instagram/exchange`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ code })
            }
          );

          const data = await result.json();

          if (!result.ok || !data.success) {
            throw new Error(
              data.message || "Instagram connection failed."
            );
          }

          setInstagramConnected(true);
          setConnectionMessage(
            "Authorization successful. Token securely stored."
          );
        } catch (error) {
          console.error("Instagram connection error:", error);
          setConnectionError(true);
          setConnectionMessage(error.message);
        } finally {
          setConnecting(false);
        }
      })();
    },
    {
      config_id: META_CONFIG_ID,
      response_type: "code",
      override_default_response_type: true
    }
  );
};


  return (
    <div className="page-content settings-page">
      <div className="page-heading settings-page-heading">
        <div>
          <span className="eyebrow">WORKSPACE CONTROL CENTER</span>
          <h1>Settings</h1>
          <p className="muted">
            Manage your Instagram connection and publishing preferences.
          </p>
        </div>

        <div className="settings-heading-icon">
          <SettingsIcon size={25} />
        </div>
      </div>

      <div className="settings-layout">
        {/* Instagram Connection */}
        <section className="panel settings-section instagram-settings">
          <div className="settings-section-heading">
            <div className="settings-icon">
              <Camera size={23} />
            </div>

            <div>
              <span className="settings-overline">SOCIAL ACCOUNT</span>
              <h2>Instagram Account</h2>
              <p>Connect your Professional Instagram account.</p>
            </div>
          </div>

          <div className="settings-account-card">
            <div className="settings-account-info">
              <div className="settings-account-avatar">
                <Camera size={25} />
              </div>

              <div>
                <h3>@raystechlab</h3>
                <p>
                  {instagramConnected
                    ? "Authorization completed"
                    : "Instagram Professional Account"}
                </p>
              </div>
            </div>

            <span
              className={`settings-status ${
                instagramConnected ? "connected" : "pending"
              }`}
            >
              <span className="settings-status-dot" />
              {instagramConnected ? "Authorized" : "Not Connected"}
            </span>
          </div>

          <div className="settings-connection-info">
            <ShieldCheck size={19} />
            <p>
              Secure authorization through Meta. Your access token
              is handled by the backend and should never be shared.
            </p>
          </div>

          <div className="settings-connect-area">
            <div>
              <strong>
                {instagramConnected
                  ? "Instagram authorization completed"
                  : "Ready to connect your account?"}
              </strong>

              <p>
                {instagramConnected
                  ? "Token exchange was successful."
                  : "Authorize RAYS Social Publisher through Meta."}
              </p>
            </div>

            <button
              type="button"
              className="settings-connect-btn"
              onClick={connectInstagram}
              disabled={connecting || instagramConnected}
            >
              {connecting ? (
                <Loader2 size={17} className="spin" />
              ) : instagramConnected ? (
                <CheckCircle2 size={17} />
              ) : (
                <Camera size={17} />
              )}

              {connecting
                ? "Connecting..."
                : instagramConnected
                  ? "Authorized"
                  : "Connect Instagram"}

              {!connecting && !instagramConnected && (
                <ArrowUpRight size={16} />
              )}
            </button>
          </div>

          {connectionMessage && (
            <div
              className={`settings-feedback ${
                connectionError ? "error" : "success"
              }`}
            >
              {connectionError ? (
                <AlertCircle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}

              <p>{connectionMessage}</p>
            </div>
          )}
        </section>

        {/* Meta Configuration */}
        <section className="panel settings-section">
          <div className="settings-section-heading">
            <div className="settings-icon">
              <KeyRound size={23} />
            </div>

            <div>
              <span className="settings-overline">INTEGRATION</span>
              <h2>Meta API Configuration</h2>
              <p>Integration requirements and authorization status.</p>
            </div>
          </div>

          <div className="settings-checklist">
            <div className="settings-check-item">
              <div>
                <strong>Meta Developer App</strong>
                <small>RAYS Social Publisher</small>
              </div>

              <span className="settings-status configured">
                Configured
              </span>
            </div>

            <div className="settings-check-item">
              <div>
                <strong>Instagram Professional Account</strong>
                <small>@raystechlab</small>
              </div>

              <span className="settings-status configured">
                Configured
              </span>
            </div>

            <div className="settings-check-item">
              <div>
                <strong>Facebook Page Connection</strong>
                <small>Account access verification</small>
              </div>

              <span className="settings-status pending">
                To Verify
              </span>
            </div>

            <div className="settings-check-item">
              <div>
                <strong>API Authorization</strong>
                <small>Backend token exchange</small>
              </div>

              <span
                className={`settings-status ${
                  instagramConnected ? "connected" : "pending"
                }`}
              >
                {instagramConnected ? "Authorized" : "Pending"}
              </span>
            </div>
          </div>

          <div className="settings-connection-info">
            <AlertCircle size={19} />
            <p>
              Successful authorization does not by itself confirm
              publishing permissions. Account access and publishing
              permissions still need verification.
            </p>
          </div>
        </section>

        {/* Publishing Preferences */}
        <section className="panel settings-section">
          <div className="settings-section-heading">
            <div className="settings-icon">
              <Clock size={23} />
            </div>

            <div>
              <span className="settings-overline">SCHEDULING</span>
              <h2>Publishing Preferences</h2>
              <p>Configure your default posting schedule.</p>
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
              <label htmlFor="timezone">Timezone</label>

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
                <small>
                  Save preference changes locally when you click Save.
                </small>
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
                <small>
                  Notification preference for future app features.
                </small>
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
              <SettingsIcon size={23} />
            </div>

            <div>
              <span className="settings-overline">ABOUT WORKSPACE</span>
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
              <span>Authorization</span>
              <strong>
                {instagramConnected ? "Completed" : "Not Connected"}
              </strong>
            </div>
          </div>

          <p className="settings-brand-note">
            MADE WITH CARE AT RAYS TechLab
          </p>
        </section>
      </div>
    </div>
  );
}