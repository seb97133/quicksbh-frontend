import { useEffect, useState } from "react";

const Spinner = () => (
  <div style={styles.spinnerContainer}>
    <div style={styles.spinner}></div>
  </div>
);

export default function App() {
  const [places, setPlaces] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [traffic, setTraffic] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("places");

  // Couleur pour les boutons sélectionnés (violet)
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

  const updateWait = async (name, wait) => {
    await fetch("https://quicksbh-backend.onrender.com/api/places", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, wait }),
    });
    fetchData();
  };

  const updateSargasses = async (name, level) => {
    await fetch("https://quicksbh-backend.onrender.com/api/beaches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, sargasses: level }),
    });
    fetchData();
  };

  const updateTraffic = async (name, status, delay) => {
    await fetch("https://quicksbh-backend.onrender.com/api/traffic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, status, delay }),
    });
    fetchData();
  };

  // Icônes optimisées
  const getIcon = (type, category) => {
    if (category === "places") {
      switch (type) {
        case "poste": return "📬";
        case "supermarche": return "🛒";
        default: return "📍";
      }
    } else if (category === "beaches") {
      return "🏖️";
    } else if (category === "traffic") {
      return "🚦";
    }
  };

  // Icône pour chaque statut de trafic
  const getTrafficStatusIcon = (status) => {
    switch (status) {
      case "fluide": return "🟢";
      case "modéré": return "🟡";
      case "dense": return "🔴";
      case "bloqué": return "❌";
      default: return "🚦";
    }
  };

  // Couleurs optimisées pour les statuts
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

  // Couleur des boutons de temps d'attente (violet si sélectionné)
  const getWaitButtonColor = (wait, currentWait) => {
    return wait === currentWait ? SELECTED_COLOR : (wait <= 10 ? "#2ecc71" : wait <= 15 ? "#f1c40f" : "#e74c3c");
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <h1 style={styles.title}>📍 QuickSBH</h1>

      {/* Filtre unifié */}
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
          {/* Section Lieux (commerces) */}
          {activeTab === "places" && (
            <>
              {places.length > 0 ? (
                places.map((place) => (
                  <div key={place.id} style={styles.card}>
                    <p style={styles.cardTitle}>
                      {getIcon(place.type, "places")} {place.name} → <strong>{place.wait || "?"} min</strong>
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

          {/* Section Plages */}
          {activeTab === "beaches" && (
            <>
              {beaches.length > 0 ? (
                beaches.map((beach) => (
                  <div key={beach.id} style={styles.card}>
                    <p style={styles.cardTitle}>
                      {getIcon(null, "beaches")} {beach.name} → <strong style={{ color: getStatusColor(beach.sargasses, "beaches") }}>
                        {beach.sargasses || "?"}
                      </strong>
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

          {/* Section Trafic */}
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
  loading: { textAlign: "center", color: "#7f8c8d" },
  error: { textAlign: "center", color: "#e74c3c" },
  empty: { textAlign: "center", color: "#95a5a6", fontStyle: "italic" },
};