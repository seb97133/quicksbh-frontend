import { useEffect, useState } from "react";

const Spinner = () => (
  <div style={styles.spinnerContainer}>
    <div style={styles.spinner}></div>
  </div>
);

// Helper pour formater la date de mise à jour
const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `MAJ il y a ${minutes} min`;
  if (hours < 24) return `MAJ il y a ${hours} h`;
  return `MAJ il y a ${Math.floor(hours / 24)} jours`;
};

export default function App() {
  const [places, setPlaces] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("places");
  const SELECTED_COLOR = "#9b59b6";

  const fetchData = async () => {
    try {
      const [placesRes, beachesRes, trafficRes] = await Promise.all([
        fetch("https://quicksbh-backend.onrender.com/api/places"),
        fetch("https://quicksbh-backend.onrender.com/api/beaches"),
        fetch("https://quicksbh-backend.onrender.com/api/traffic"),
      ]);

      if (!placesRes.ok || !beachesRes.ok || !trafficRes.ok) {
        throw new Error("Erreur lors de la récupération des données");
      }

      const placesData = await placesRes.json();
      const beachesData = await beachesRes.json();
      const trafficData = await trafficRes.json();

      setPlaces(placesData);
      setBeaches(beachesData);
      setTraffic(trafficData);
      setError(null);
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rafraîchissement automatique toutes les 30 secondes
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      console.log("⏳ Rafraîchissement des données...");
      fetchData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateWait = async (name, wait) => {
    await fetch("https://quicksbh-backend.onrender.com/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        wait,
        updatedBy: "Utilisateur Anonyme" // À remplacer par user.name si connecté
      }),
    });
    fetchData(); // Rafraîchit les données après MAJ
  };

  const updateSargasses = async (name, level) => {
    await fetch("https://quicksbh-backend.onrender.com/api/beaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        sargasses: level,
        updatedBy: "Utilisateur Anonyme"
      }),
    });
    fetchData();
  };

  const updateTraffic = async (name, status, delay) => {
    await fetch("https://quicksbh-backend.onrender.com/api/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        status,
        delay,
        updatedBy: "Utilisateur Anonyme"
      }),
    });
    fetchData();
  };

  // Icônes et couleurs (comme dans ton code original)
  const getIcon = (type, category) => {
    if (category === "places") {
      switch (type) {
        case "poste": return "📬";
        case "supermarche": return "🛒";
        default: return "📍";
      }
    } else if (category === "beaches") return "🏖️";
    else if (category === "traffic") return "🚦";
  };

  const getTrafficStatusIcon = (status) => {
    switch (status) {
      case "fluide": return "🟢";
      case "modéré": return "🟡";
      case "dense": return "🔴";
      case "bloqué": return "❌";
      default: return "🚦";
    }
  };

  const getStatusColor = (status, category) => {
    if (category === "beaches") {
      switch (status) {
        case "forte": return "#e74c3c";
        case "moyenne": return "#f39c12";
        case "faible": return "#2ecc71";
        default: return "#3498db";
      }
    } else if (category === "traffic") {
      switch (status) {
        case "bloqué": return "#e74c3c";
        case "dense": return "#f39c12";
        case "modéré": return "#f1c40f";
        default: return "#2ecc71";
      }
    }
    return "#3498db";
  };

  const getWaitButtonColor = (wait, currentWait) => {
    return wait === currentWait ? SELECTED_COLOR : (wait <= 10 ? "#2ecc71" : wait <= 15 ? "#f1c40f" : "#e74c3c");
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <h1 style={styles.title}>📍 QuickSBH</h1>

      <div style={styles.tabContainer}>
        <button
          onClick={() => setActiveTab("places")}
          style={activeTab === "places" ? { ...styles.tabButton, ...styles.activeTab } : styles.tabButton}
        >
          📍 Lieux ({places.length})
        </button>
        <button
          onClick={() => setActiveTab("beaches")}
          style={activeTab === "beaches" ? { ...styles.tabButton, ...styles.activeTab } : styles.tabButton}
        >
          🏖️ Plages ({beaches.length})
        </button>
        <button
          onClick={() => setActiveTab("traffic")}
          style={activeTab === "traffic" ? { ...styles.tabButton, ...styles.activeTab } : styles.tabButton}
        >
          🚦 Trafic ({traffic.length})
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p style={styles.error}>❌ Erreur: {error}</p>
      ) : (
        <>
          {activeTab === "places" && (
            <>
              {places.length > 0 ? (
                places.map((place) => (
                  <div key={place.id} style={styles.card}>
                    <p style={styles.cardTitle}>
                      {getIcon(place.type, "places")} {place.name} → <strong>{place.wait || "?"} min</strong>
                      {place.updatedAt && (
                        <span style={styles.updateInfo}>
                          {timeAgo(place.updatedAt)}
                          {place.updatedBy && place.updatedBy !== "Système" && (
                            <span> par {place.updatedBy}</span>
                          )}
                        </span>
                      )}
                    </p>
                    <div style={styles.buttonGroup}>
                      {[5, 10, 15, 20].map((wait) => (
                        <button
                          key={wait}
                          onClick={() => updateWait(place.name, wait)}
                          style={{
                            ...styles.button,
                            backgroundColor: getWaitButtonColor(wait, place.wait),
                          }}
                        >
                          {wait} min
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p style={styles.empty}>Aucun lieu trouvé.</p>
              )}
            </>
          )}

          {activeTab === "beaches" && (
            <>
              {beaches.length > 0 ? (
                beaches.map((beach) => (
                  <div key={beach.id} style={styles.card}>
                    <p style={styles.cardTitle}>
                      {getIcon(null, "beaches")} {beach.name} → <strong style={{ color: getStatusColor(beach.sargasses, "beaches") }}>
                        {beach.sargasses || "?"}
                      </strong>
                      {beach.updatedAt && (
                        <span style={styles.updateInfo}>
                          {timeAgo(beach.updatedAt)}
                          {beach.updatedBy && beach.updatedBy !== "Système" && (
                            <span> par {beach.updatedBy}</span>
                          )}
                        </span>
                      )}
                    </p>
                    <div style={styles.buttonGroup}>
                      {["aucune", "faible", "moyenne", "forte"].map((level) => (
                        <button
                          key={level}
                          onClick={() => updateSargasses(beach.name, level)}
                          style={{
                            ...styles.button,
                            backgroundColor: level === beach.sargasses ? SELECTED_COLOR : getStatusColor(level, "beaches"),
                          }}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p style={styles.empty}>Aucune plage trouvée.</p>
              )}
            </>
          )}

          {activeTab === "traffic" && (
            <>
              {traffic.length > 0 ? (
                traffic.map((t) => (
                  <div key={t.id} style={styles.card}>
                    <p style={styles.cardTitle}>
                      {getIcon(null, "traffic")} {t.name} →{" "}
                      <strong>
                        {getTrafficStatusIcon(t.status)} {t.status}
                      </strong>{" "}
                      (Retard: <strong>{t.delay} min</strong>)
                      {t.updatedAt && (
                        <span style={styles.updateInfo}>
                          {timeAgo(t.updatedAt)}
                          {t.updatedBy && t.updatedBy !== "Système" && (
                            <span> par {t.updatedBy}</span>
                          )}
                        </span>
                      )}
                    </p>
                    <div style={styles.buttonGroup}>
                      {["fluide", "modéré", "dense", "bloqué"].map((status) => (
                        <button
                          key={status}
                          onClick={() => updateTraffic(t.name, status, t.delay)}
                          style={{
                            ...styles.button,
                            backgroundColor: status === t.status ? SELECTED_COLOR : getStatusColor(status, "traffic"),
                          }}
                        >
                          {getTrafficStatusIcon(status)} {status}
                        </button>
                      ))}
                    </div>
                    <div style={styles.delayButtons}>
                      {[0, 5, 10, 15, 20].map((delay) => (
                        <button
                          key={delay}
                          onClick={() => updateTraffic(t.name, t.status, delay)}
                          style={{
                            ...styles.button,
                            backgroundColor: delay === t.delay ? SELECTED_COLOR : (delay === 0 ? "#2ecc71" : delay <= 10 ? "#f1c40f" : "#e74c3c"),
                          }}
                        >
                          {delay} min
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p style={styles.empty}>Aucune donnée de trafic disponible.</p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: 20, maxWidth: 600, margin: "0 auto", fontFamily: "Arial, sans-serif" },
  title: { textAlign: "center", color: "#2c3e50", fontSize: 24, marginBottom: 20 },
  tabContainer: { display: "flex", marginBottom: 20, borderBottom: "1px solid #eee" },
  tabButton: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: 16,
    textAlign: "center",
    color: "#7f8c8d",
  },
  activeTab: { color: "#3498db", borderBottom: "2px solid #3498db" },
  card: { backgroundColor: "#f9f9f9", borderRadius: 8, padding: 15, marginBottom: 15, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  cardTitle: { margin: 0, fontSize: 16, marginBottom: 10 },
  buttonGroup: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 },
  delayButtons: { display: "flex", gap: 10, flexWrap: "wrap" },
  button: { padding: "8px 12px", border: "none", borderRadius: 4, color: "white", cursor: "pointer", fontSize: 14 },
  spinnerContainer: { display: "flex", justifyContent: "center", margin: "20px 0" },
  spinner: { border: "4px solid rgba(0, 0, 0, 0.1)", borderRadius: "50%", borderTop: "4px solid #3498db", width: "40px", height: "40px", animation: "spin 1s linear infinite" },
  error: { textAlign: "center", color: "#e74c3c" },
  empty: { textAlign: "center", color: "#95a5a6", fontStyle: "italic" },
  updateInfo: {
    display: "block",
    fontSize: 12,
    color: "#95a5a6",
    fontStyle: "italic",
    marginTop: 4,
  },
};