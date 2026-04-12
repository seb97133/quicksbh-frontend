import { useEffect, useState } from "react";

const Spinner = () => (
  <div style={styles.spinnerContainer}>
    <div style={styles.spinner}></div>
  </div>
);

export default function App() {
  const [places, setPlaces] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchData = async () => {
    try {
      const [placesRes, beachesRes] = await Promise.all([
        fetch("http://localhost:3001/api/places"),
        fetch("http://localhost:3001/api/beaches"),
      ]);

      if (!placesRes.ok || !beachesRes.ok) throw new Error("Erreur lors de la récupération des données");

      const placesData = await placesRes.json();
      const beachesData = await beachesRes.json();

      setPlaces(placesData);
      setBeaches(beachesData);
      setError(null);
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateWait = async (name, wait) => {
    try {
      await fetch("http://localhost:3001/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, wait }),
      });
      fetchData();
    } catch (err) {
      console.error("❌ Erreur MAJ temps:", err);
    }
  };

  const updateSargasses = async (name, level) => {
    try {
      await fetch("http://localhost:3001/api/beaches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sargasses: level }),
      });
      fetchData();
    } catch (err) {
      console.error("❌ Erreur MAJ sargasses:", err);
    }
  };

  const getPlaceIcon = (type) => {
    switch (type) {
      case "poste": return "📬";
      case "supermarche": return "🛒";
      default: return "📍";
    }
  };

  const filteredPlaces = filter === "all" ? places : places.filter((place) => place.type === filter);

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

      {loading ? (
        <Spinner />
      ) : error ? (
        <p style={styles.error}>❌ Erreur: {error}</p>
      ) : (
        <>
          <h2 style={styles.sectionTitle}>⏱️ Temps d’attente</h2>
          <div style={styles.filterContainer}>
            <button
              onClick={() => setFilter("all")}
              style={filter === "all" ? { ...styles.filterButton, ...styles.activeFilter } : styles.filterButton}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter("poste")}
              style={filter === "poste" ? { ...styles.filterButton, ...styles.activeFilter } : styles.filterButton}
            >
              Postes 📬
            </button>
            <button
              onClick={() => setFilter("supermarche")}
              style={filter === "supermarche" ? { ...styles.filterButton, ...styles.activeFilter } : styles.filterButton}
            >
              Supermarchés 🛒
            </button>
          </div>
          {filteredPlaces.length > 0 ? (
            filteredPlaces.map((place) => (
              <div key={place.id} style={styles.card}>
                <p style={styles.cardTitle}>
                  {getPlaceIcon(place.type)} {place.name} → <strong>{place.wait || "?"} min</strong>
                </p>
                <div style={styles.buttonGroup}>
                  {[5, 10, 15, 20].map((wait) => (
                    <button
                      key={wait}
                      onClick={() => updateWait(place.name, wait)}
                      style={styles.button}
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

          <h2 style={styles.sectionTitle}>🌊 Sargasses</h2>
          {beaches.length > 0 ? (
            beaches.map((beach) => (
              <div key={beach.id} style={styles.card}>
                <p style={styles.cardTitle}>🏖️ {beach.name} → <strong>{beach.sargasses || "?"}</strong></p>
                <div style={styles.buttonGroup}>
                  {["aucune", "faible", "moyenne", "forte"].map((level) => (
                    <button
                      key={level}
                      onClick={() => updateSargasses(beach.name, level)}
                      style={{
                        ...styles.button,
                        backgroundColor:
                          level === "forte" ? "#ff6b6b" :
                          level === "moyenne" ? "#ffd166" :
                          level === "faible" ? "#06d6a0" : "#4cc9f0",
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
    </div>
  );
}

const styles = {
  container: { padding: 20, maxWidth: 600, margin: "0 auto", fontFamily: "Arial, sans-serif" },
  title: { textAlign: "center", color: "#2c3e50", fontSize: 24 },
  sectionTitle: { marginTop: 20, color: "#3498db", borderBottom: "1px solid #eee", paddingBottom: 5, fontSize: 18 },
  card: { backgroundColor: "#f9f9f9", borderRadius: 8, padding: 15, marginBottom: 15, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  cardTitle: { margin: 0, fontSize: 16, marginBottom: 10 },
  buttonGroup: { display: "flex", gap: 10, flexWrap: "wrap" },
  button: { padding: "8px 12px", border: "none", borderRadius: 4, backgroundColor: "#3498db", color: "white", cursor: "pointer", fontSize: 14 },
  spinnerContainer: { display: "flex", justifyContent: "center", margin: "20px 0" },
  spinner: { border: "4px solid rgba(0, 0, 0, 0.1)", borderRadius: "50%", borderTop: "4px solid #3498db", width: "40px", height: "40px", animation: "spin 1s linear infinite" },
  loading: { textAlign: "center", color: "#7f8c8d" },
  error: { textAlign: "center", color: "#e74c3c" },
  empty: { textAlign: "center", color: "#95a5a6", fontStyle: "italic" },
  filterContainer: { display: "flex", gap: 10, marginBottom: 15, justifyContent: "center" },
  filterButton: { padding: "8px 16px", border: "1px solid #ddd", borderRadius: 4, backgroundColor: "#f9f9f9", cursor: "pointer" },
  activeFilter: { backgroundColor: "#3498db", color: "white", borderColor: "#3498db" },
};