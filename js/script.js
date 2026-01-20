// ===========================
// GLOBAL STATE & CONFIGURATION
// ===========================
let currentView = "geographic";
let globalData = [];
let stateGeoData = null;

// Risk Factor Analysis specific state
let allRecords = [];
let currentMetric = "stroke_rate_pct";
let customMode = false;
let selectedRiskCombinations = [];

// Geographic view specific state
let currentGeoPalette = "default";

// State comparison variables
let comparisonMode = false;
let selectedStatesForComparison = [];

// Loading state
let isDataLoaded = false;

// ===========================
// LOADER FUNCTIONS
// ===========================
function showLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    loader.classList.remove("hidden");
    document.body.classList.add("loading-data");
  }
}

function hideLoader() {
  const loader = document.getElementById("global-loader");
  if (loader) {
    // Add a small delay for smooth transition
    setTimeout(() => {
      loader.classList.add("hidden");
      document.body.classList.remove("loading-data");
      isDataLoaded = true;
    }, 500);
  }
}

// Rest of the script content will be added from the uploaded file
// but with modifications to loadData() function

// Color palettes (expanded for 50+ states)
const COLOR_PALETTES = {
  default: [
    "#10b981",
    "#0d9488",
    "#059669",
    "#047857",
    "#065f46",
    "#ef4444",
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#ea580c",
    "#7c3aed",
    "#db2777",
    "#0891b2",
    "#c026d3",
    "#0284c7",
    "#9333ea",
    "#be123c",
    "#4338ca",
    "#94a3b8",
    "#475569",
    "#64748b",
    "#71717a",
    "#78716c",
    "#57534e",
    "#44403c",
    "#a3e635",
    "#84cc16",
    "#65a30d",
    "#4d7c0f",
    "#fbbf24",
    "#f59e0b",
    "#d97706",
    "#b45309",
    "#92400e",
    "#fb923c",
    "#f97316",
    "#ea580c",
    "#c2410c",
    "#9a3412",
    "#fb7185",
    "#f43f5e",
    "#e11d48",
    "#be123c",
    "#9f1239",
    "#c084fc",
    "#a855f7",
    "#9333ea",
    "#7e22ce",
    "#6b21a8",
    "#d946ef",
    "#c026d3",
    "#a21caf",
    "#86198f",
  ],
  categorical: [
    "#e41a1c",
    "#377eb8",
    "#4daf4a",
    "#984ea3",
    "#ff7f00",
    "#ffff33",
    "#a65628",
    "#f781bf",
    "#66c2a5",
    "#fc8d62",
    "#8da0cb",
    "#e78ac3",
    "#a6d854",
    "#ffd92f",
    "#e5c494",
    "#b3b3b3",
    "#8dd3c7",
    "#fb8072",
    "#80b1d3",
    "#fdb462",
    "#b3de69",
    "#fccde5",
    "#d9d9d9",
    "#bc80bd",
    "#ccebc5",
    "#1b9e77",
    "#d95f02",
    "#7570b3",
    "#e7298a",
    "#66a61e",
    "#e6ab02",
    "#a6761d",
    "#666666",
    "#8e0152",
    "#c51b7d",
    "#de77ae",
    "#f1b6da",
    "#fde0ef",
    "#e6f5d0",
    "#b8e186",
    "#7fbc41",
    "#4d9221",
    "#276419",
    "#543005",
    "#8c510a",
    "#bf812d",
    "#dfc27d",
    "#f6e8c3",
    "#c7eae5",
    "#80cdc1",
    "#35978f",
    "#01665e",
    "#003c30",
    "#b35806",
    "#e08214",
  ],
  warm: [
    "#8c2d04",
    "#cc4c02",
    "#ec7014",
    "#fe9929",
    "#fec44f",
    "#fee391",
    "#d94801",
    "#f16913",
    "#fd8d3c",
    "#fdae6b",
    "#fdd0a2",
    "#feedde",
    "#a63603",
    "#e6550d",
    "#fd8d3c",
    "#fdae6b",
    "#fdd0a2",
    "#fff5eb",
    "#7f2704",
    "#b35806",
    "#e08214",
    "#fdb863",
    "#fee0b6",
    "#f7f7f7",
    "#d8daeb",
    "#b2abd2",
    "#8073ac",
    "#542788",
    "#2d004b",
    "#8c510a",
    "#bf812d",
    "#dfc27d",
    "#f6e8c3",
    "#f5f5f5",
    "#c7eae5",
    "#80cdc1",
    "#35978f",
    "#01665e",
    "#d73027",
    "#f46d43",
    "#fdae61",
    "#fee090",
    "#ffffbf",
    "#e0f3f8",
    "#abd9e9",
    "#74add1",
    "#4575b4",
    "#313695",
    "#a50026",
    "#d73027",
    "#f46d43",
    "#fdae61",
    "#fee08b",
    "#d9ef8b",
  ],
  cool: [
    "#08519c",
    "#3182bd",
    "#6baed6",
    "#9ecae1",
    "#c6dbef",
    "#eff3ff",
    "#08306b",
    "#2171b5",
    "#4292c6",
    "#6baed6",
    "#9ecae1",
    "#c6dbef",
    "#084594",
    "#2171b5",
    "#4292c6",
    "#6baed6",
    "#9ecae1",
    "#deebf7",
    "#08306b",
    "#2879b5",
    "#4a9bd6",
    "#6fb5e1",
    "#96cdef",
    "#bfd9f3",
    "#e0edf7",
    "#f7fbff",
    "#08519c",
    "#3182bd",
    "#6baed6",
    "#9ecae1",
    "#c6dbef",
    "#eff3ff",
    "#002c69",
    "#084594",
    "#2171b5",
    "#4292c6",
    "#6baed6",
    "#9ecae1",
    "#c6dbef",
    "#deebf7",
    "#08306b",
    "#08519c",
    "#2171b5",
    "#4292c6",
    "#6baed6",
    "#9ecae1",
    "#c6dbef",
    "#eff3ff",
    "#001f4d",
    "#003875",
    "#00509d",
    "#0068c5",
    "#0080ed",
    "#3399ff",
    "#66b3ff",
    "#99ccff",
  ],
  vibrant: [
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#9e9e9e",
    "#607d8b",
    "#f06292",
    "#ba68c8",
    "#9575cd",
    "#7986cb",
    "#64b5f6",
    "#4dd0e1",
    "#4db6ac",
    "#81c784",
    "#aed581",
    "#dce775",
    "#fff176",
    "#ffd54f",
    "#ffb74d",
    "#ff8a65",
    "#a1887f",
    "#e0e0e0",
    "#90a4ae",
    "#ec407a",
    "#ab47bc",
    "#7e57c2",
    "#5c6bc0",
    "#42a5f5",
    "#29b6f6",
    "#26c6da",
    "#26a69a",
    "#66bb6a",
    "#9ccc65",
    "#d4e157",
    "#ffee58",
    "#ffca28",
    "#ffa726",
    "#ff7043",
    "#8d6e63",
    "#bdbdbd",
    "#78909c",
    "#880e4f",
    "#4a148c",
  ],
  pastel: [
    "#ffcdd2",
    "#f8bbd0",
    "#e1bee7",
    "#d1c4e9",
    "#c5cae9",
    "#bbdefb",
    "#b3e5fc",
    "#b2ebf2",
    "#b2dfdb",
    "#c8e6c9",
    "#dcedc8",
    "#f0f4c3",
    "#fff9c4",
    "#ffecb3",
    "#ffe0b2",
    "#ffccbc",
    "#d7ccc8",
    "#f5f5f5",
    "#cfd8dc",
    "#fce4ec",
    "#f3e5f5",
    "#ede7f6",
    "#e8eaf6",
    "#e3f2fd",
    "#e1f5fe",
    "#e0f2f1",
    "#e8f5e9",
    "#f1f8e9",
    "#f9fbe7",
    "#fffde7",
    "#fff8e1",
    "#fff3e0",
    "#fbe9e7",
    "#efebe9",
    "#fafafa",
    "#eceff1",
    "#ff8a80",
    "#ff80ab",
    "#ea80fc",
    "#b388ff",
    "#8c9eff",
    "#82b1ff",
    "#80d8ff",
    "#84ffff",
    "#a7ffeb",
    "#b9f6ca",
    "#ccff90",
    "#f4ff81",
    "#ffff8d",
    "#ffe57f",
    "#ffd180",
    "#ff9e80",
    "#bcaaa4",
    "#eeeeee",
  ],
};

// Define available color schemes for Risk Factor Analysis
const colorPalettes = {
  default: {
    name: "Default",
    colors: [
      "#059669",
      "#2563eb",
      "#f97316",
      "#a855f7",
      "#b91c1c",
      "#ec4899",
      "#06b6d4",
      "#ea580c",
      "#7c3aed",
      "#db2777",
      "#0891b2",
      "#c026d3",
      "#0284c7",
      "#9333ea",
      "#be123c",
      "#4338ca",
      "#94a3b8",
    ],
  },
  categorical: {
    name: "Categorical",
    colors: [
      "#e41a1c",
      "#377eb8",
      "#4daf4a",
      "#984ea3",
      "#ff7f00",
      "#ffff33",
      "#a65628",
      "#f781bf",
      "#66c2a5",
      "#fc8d62",
      "#8da0cb",
      "#e78ac3",
      "#a6d854",
      "#ffd92f",
      "#e5c494",
      "#b3b3b3",
      "#8dd3c7",
    ],
  },
  warm: {
    name: "Warm",
    colors: [
      "#8c2d04",
      "#cc4c02",
      "#ec7014",
      "#fe9929",
      "#fec44f",
      "#fee391",
      "#d94801",
      "#f16913",
      "#fd8d3c",
      "#fdae6b",
      "#fdd0a2",
      "#feedde",
      "#a63603",
      "#e6550d",
      "#fd8d3c",
      "#fdae6b",
      "#fdd0a2",
    ],
  },
  cool: {
    name: "Cool",
    colors: [
      "#08519c",
      "#3182bd",
      "#6baed6",
      "#9ecae1",
      "#c6dbef",
      "#eff3ff",
      "#08306b",
      "#2171b5",
      "#4292c6",
      "#6baed6",
      "#9ecae1",
      "#c6dbef",
      "#084594",
      "#2171b5",
      "#4292c6",
      "#6baed6",
      "#9ecae1",
    ],
  },
  vibrant: {
    name: "Vibrant",
    colors: [
      "#e91e63",
      "#9c27b0",
      "#673ab7",
      "#3f51b5",
      "#2196f3",
      "#03a9f4",
      "#00bcd4",
      "#009688",
      "#4caf50",
      "#8bc34a",
      "#cddc39",
      "#ffeb3b",
      "#ffc107",
      "#ff9800",
      "#ff5722",
      "#795548",
      "#9e9e9e",
    ],
  },
  pastel: {
    name: "Pastel",
    colors: [
      "#ffcdd2",
      "#f8bbd0",
      "#e1bee7",
      "#d1c4e9",
      "#c5cae9",
      "#bbdefb",
      "#b3e5fc",
      "#b2ebf2",
      "#b2dfdb",
      "#c8e6c9",
      "#dcedc8",
      "#f0f4c3",
      "#fff9c4",
      "#ffecb3",
      "#ffe0b2",
      "#ffccbc",
      "#d7ccc8",
    ],
  },
};

let currentPalette = "default";

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation();
  loadData();
});

// ===========================
// NAVIGATION MANAGEMENT
// ===========================
function initializeNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  const toggleBtn = document.getElementById("toggle-btn");
  const sidenav = document.getElementById("sidenav");
  const mainContent = document.getElementById("main-content");

  // View switching
  navButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Prevent navigation if data is not loaded yet
      if (!isDataLoaded) {
        showToast("Please wait for data to load", "warning");
        return;
      }

      const view = btn.getAttribute("data-view");
      switchView(view);

      // Update active state
      navButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Scroll to top of the page smoothly
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Alternative: If scroll the main-content div instead
      // const mainContent = document.getElementById("main-content");
      // if (mainContent) {
      //   mainContent.scrollTop = 0;
      // }

      // Close sidebar on mobile
      if (window.innerWidth <= 1024) {
        sidenav.classList.remove("open");
      }
    });
  });

  // Sidebar toggle for mobile
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      sidenav.classList.toggle("open");
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 1024) {
      if (!sidenav.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidenav.classList.remove("open");
      }
    }
  });
}

function switchView(view) {
  currentView = view;

  // Close any open panels when switching views
  const riskPanel = document.getElementById("risk-customization-panel");
  const comparisonPanel = document.getElementById("state-comparison-panel");

  if (riskPanel) {
    riskPanel.style.display = "none";
  }

  if (comparisonPanel) {
    comparisonPanel.style.display = "none";
    // Also reset comparison mode
    comparisonMode = false;
    selectedStatesForComparison = [];

    // Clear any selected states visual styling
    d3.selectAll(".state")
      .classed("selected-for-comparison", false)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.85);

    // Reset compare button if it exists
    const compareBtn = document.getElementById("compare-states-btn");
    if (compareBtn) {
      compareBtn.textContent = "🔍 Compare States";
      compareBtn.style.background =
        "linear-gradient(135deg, #10b981 0%, #0d9488 100%)";
    }
  }

  // Hide all views
  document.querySelectorAll(".view-container").forEach((v) => {
    v.classList.remove("active");
  });

  // Show selected view
  const viewContainer = document.getElementById(`view-${view}`);
  if (viewContainer) {
    viewContainer.classList.add("active");
  }

  // Update page title
  const titles = {
    "risk-profile": "Risk Factor Analysis — BRFSS 2024",
    geographic: "Geographic Health Disparities — BRFSS 2024",
    demographic: "Demographic Health Comparison — BRFSS 2024",
    correlation: "Risk Factor Clustering Analysis — BRFSS 2024",
  };

  const subtitles = {
    "risk-profile":
      "Interactive visualization with customizable risk factor analysis",
    geographic:
      "Explore state-level health indicator patterns across the United States",
    demographic: "Compare health outcomes across demographic groups",
    correlation: "Understand how risk factors cluster and co-occur",
  };

  document.getElementById("page-title").textContent =
    titles[view] || titles["risk-profile"];
  document.getElementById("page-subtitle").textContent =
    subtitles[view] || subtitles["risk-profile"];

  // Initialize the appropriate visualization
  if (globalData.length > 0) {
    switch (view) {
      case "risk-profile":
        initializeRiskProfileView();
        break;
      case "geographic":
        initializeGeographicView();
        break;
      case "demographic":
        initializeDemographicView();
        break;
      case "correlation":
        initializeCorrelationView();
        break;
    }
  }
}

// ===========================
// DATA LOADING
// ===========================
async function loadData() {
  try {
    // Load CSV data
    const data = await d3.csv(
      //"data/BRFSS_2024_full.csv",
      "https://raw.githubusercontent.com/ShahriyarHridoy/D3-js_Interactive-Visualization-with-BRFSS_2024_Dataset/main/data/BRFSS_small_100000_data.csv?v1",
      (d) => ({
        age_group: d._AGE_G || d.age_group,
        state: d._STATE || d.state,
        sex: d.SEX || d.sex,
        income: d.INCOME3 || d.income,
        education: d._EDUCAG || d.education,
        race: d._RACE || d.race,
        has_stroke: +d.CVDSTRK3 === 1,
        is_smoker: +d._RFSMOK3 === 1,
        has_diabetes: +d.DIABETE4 === 1 || +d.DIABETE4 === 2,
        has_prediabetes: +d.PREDIAB2 === 1,
        is_obese: +d._RFBMI5 === 1,
        has_heart_disease: +d.CVDCRHD4 === 1,
        bmi: +d._BMI5 || null,
      }),
    );

    globalData = data.filter((d) => d.age_group);
    allRecords = globalData; // For Risk Factor Analysis

    console.log("=== DATA LOADED ===");
    console.log("Total records:", globalData.length);
    const uniqueStates = Array.from(
      new Set(globalData.map((d) => d.state)),
    ).sort();
    console.log("Unique states in data:", uniqueStates.length);
    console.log("State codes found:", uniqueStates);

    // Initialize the current view
    initializeGeographicView();

    // Hide loader after data is loaded and view is initialized
    hideLoader();
  } catch (error) {
    console.error("Error loading data:", error);

    // Hide loader after data is loaded and view is initialized
    hideLoader();

    showError("Failed to load data. Please check the CSV file.");
  }
}

// ===========================
// VIEW 1: RISK PROFILE ANALYSIS
// ===========================
function initializeRiskProfileView() {
  if (!globalData.length) return;

  // Initialize the Risk Factor Analysis with full functionality
  renderChart(globalData, customMode, selectedRiskCombinations);

  // Set up controls with complete interaction handlers
  setupRiskProfileControls();
}

// Convert BRFSS age codes to readable labels
function mapAgeGroup(code) {
  const ageMap = {
    1: "18-34",
    2: "35-44",
    3: "45-54",
    4: "55-64",
    5: "65-74",
    6: "75+",
  };
  return ageMap[+code] || null;
}

// Count risk factors from label text
function countRiskFactorsInLabel(label) {
  if (label === "No Risk Factors") return 0;
  if (label === "Two Risk Factors") return 2;
  if (label === "3+ Risk Factors") return 3;

  const plusCount = (label.match(/\+/g) || []).length;
  return plusCount + 1;
}

// Get sorting priority based on risk count
function getRiskSortPriority(label) {
  const count = countRiskFactorsInLabel(label);
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

// Sort risk profiles in logical order
function sortRiskProfilesSequentially(riskProfiles) {
  return riskProfiles.sort((a, b) => {
    const priorityA = getRiskSortPriority(a);
    const priorityB = getRiskSortPriority(b);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.localeCompare(b);
  });
}

// Main render function for Risk Factor Analysis
function renderChart(rawData, isCustomMode, customCombinations) {
  let aggregatedData;

  if (isCustomMode && customCombinations.length > 0) {
    aggregatedData = aggregateCustomSelections(rawData, customCombinations);
  } else {
    aggregatedData = aggregateDefaultProfiles(rawData);
  }

  if (!aggregatedData || aggregatedData.length === 0) {
    console.error("No aggregated data to render");
    return;
  }

  updateChart(aggregatedData, currentMetric, true);
}

// Aggregate default risk profiles
function aggregateDefaultProfiles(data) {
  const grouped = d3.group(data, (d) => mapAgeGroup(d.age_group));
  const results = [];

  grouped.forEach((records, ageLabel) => {
    if (!ageLabel) return;

    const profiles = [
      {
        label: "No Risk Factors",
        filter: (r) =>
          !r.is_smoker &&
          !r.has_diabetes &&
          !r.has_prediabetes &&
          !r.is_obese &&
          !r.has_heart_disease,
      },
      {
        label: "Smoker Only",
        filter: (r) =>
          r.is_smoker &&
          !r.has_diabetes &&
          !r.has_prediabetes &&
          !r.is_obese &&
          !r.has_heart_disease,
      },
      {
        label: "Diabetes Only",
        filter: (r) =>
          !r.is_smoker &&
          r.has_diabetes &&
          !r.has_prediabetes &&
          !r.is_obese &&
          !r.has_heart_disease,
      },
      {
        label: "Two Risk Factors",
        filter: (r) =>
          [
            r.is_smoker,
            r.has_diabetes,
            r.has_prediabetes,
            r.is_obese,
            r.has_heart_disease,
          ].filter(Boolean).length === 2,
      },
      {
        label: "3+ Risk Factors",
        filter: (r) =>
          [
            r.is_smoker,
            r.has_diabetes,
            r.has_prediabetes,
            r.is_obese,
            r.has_heart_disease,
          ].filter(Boolean).length >= 3,
      },
    ];

    profiles.forEach((profile) => {
      const subset = records.filter(profile.filter);
      const strokeCount = subset.filter((r) => r.has_stroke).length;
      const total = subset.length;

      if (total > 0) {
        results.push({
          age_group: ageLabel,
          risk_profile: profile.label,
          stroke_cases: strokeCount,
          total: total,
          stroke_rate_pct: (strokeCount / total) * 100,
        });
      }
    });
  });

  return results;
}

// Aggregate custom risk selections
function aggregateCustomSelections(data, combinations) {
  const grouped = d3.group(data, (d) => mapAgeGroup(d.age_group));
  const results = [];

  const labelMap = {
    no_risk_factors: "No Risk Factors",
    is_smoker: "Current Smoker",
    has_diabetes: "Diabetes",
    has_prediabetes: "Prediabetes",
    is_obese: "Obesity (BMI ≥30)",
    has_heart_disease: "Heart Disease",
    "is_smoker,has_diabetes": "Smoker + Diabetes",
    "is_smoker,is_obese": "Smoker + Obesity",
    "is_smoker,has_heart_disease": "Smoker + Heart Disease",
    "has_diabetes,is_obese": "Diabetes + Obesity",
    "has_diabetes,has_heart_disease": "Diabetes + Heart Disease",
    "is_obese,has_heart_disease": "Obesity + Heart Disease",
    "is_smoker,has_diabetes,is_obese": "Smoker + Diabetes + Obesity",
    "is_smoker,has_diabetes,has_heart_disease":
      "Smoker + Diabetes + Heart Disease",
    "is_smoker,is_obese,has_heart_disease": "Smoker + Obesity + Heart Disease",
    "has_diabetes,is_obese,has_heart_disease":
      "Diabetes + Obesity + Heart Disease",
    "has_prediabetes,is_obese": "Prediabetes + Obesity",
    "has_prediabetes,has_heart_disease": "Prediabetes + Heart Disease",
    "has_prediabetes,is_obese,has_heart_disease":
      "Prediabetes + Obesity + Heart Disease",
  };

  grouped.forEach((records, ageLabel) => {
    if (!ageLabel) return;

    combinations.forEach((combo) => {
      let subset = records;

      if (combo === "no_risk_factors") {
        subset = records.filter(
          (r) =>
            !r.is_smoker &&
            !r.has_diabetes &&
            !r.has_prediabetes &&
            !r.is_obese &&
            !r.has_heart_disease,
        );
      } else {
        const factors = combo.split(",");
        subset = records.filter((r) =>
          factors.every((factor) => r[factor.trim()]),
        );
      }

      const strokeCount = subset.filter((r) => r.has_stroke).length;
      const total = subset.length;

      if (total > 0) {
        results.push({
          age_group: ageLabel,
          risk_profile: labelMap[combo] || combo,
          stroke_cases: strokeCount,
          total: total,
          stroke_rate_pct: (strokeCount / total) * 100,
        });
      }
    });
  });

  return results;
}

// Update legend display
function updateLegend(svg, riskProfiles, colorScale) {
  // Remove existing legend
  svg.selectAll(".legend").remove();

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(0,-45)");

  const itemsPerRow = 3;
  const itemWidth = 230;
  const itemHeight = 28;

  riskProfiles.forEach((rp, i) => {
    const row = Math.floor(i / itemsPerRow);
    const col = i % itemsPerRow;

    const g = legend
      .append("g")
      .attr("transform", `translate(${col * itemWidth},${row * itemHeight})`);

    g.append("rect")
      .attr("x", 0)
      .attr("y", -10)
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", colorScale(rp))
      .attr("stroke", "#111827")
      .attr("stroke-width", 0.8)
      .attr("rx", 2);

    const text = g
      .append("text")
      .attr("x", 20)
      .attr("y", 0)
      .attr("dominant-baseline", "central")
      .style("font-size", "0.75rem")
      .style("font-weight", "500");

    // Truncate long labels
    const maxLength = 28;
    if (rp.length > maxLength) {
      text
        .text(rp.substring(0, maxLength) + "...")
        .append("title")
        .text(rp);
    } else {
      text.text(rp);
    }
  });
}

// Update chart with new data
function updateChart(data, metric, animate) {
  const container = d3.select("#chart-container");
  container.html("");

  const margin = { top: 60, right: 20, bottom: 70, left: 70 };
  const width =
    container.node().getBoundingClientRect().width - margin.left - margin.right;
  const height = 520 - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Re-sort profiles for consistency
  let riskProfiles = Array.from(new Set(data.map((d) => d.risk_profile)));
  riskProfiles = sortRiskProfilesSequentially(riskProfiles);

  // Define age groups in ascending order (youngest to oldest - minimum to maximum)
  const ageGroups = ["18-34", "35-44", "45-54", "55-64", "65-74", "75+"];

  // Scales
  const x0 = d3
    .scaleBand()
    .domain(ageGroups)
    .range([0, width])
    .paddingInner(0.15)
    .paddingOuter(0.05);

  const x1 = d3
    .scaleBand()
    .domain(riskProfiles)
    .range([0, x0.bandwidth()])
    .padding(0.1);

  const maxVal = d3.max(data, (d) => d[metric]);
  const y = d3
    .scaleLinear()
    .domain([0, maxVal * 1.1])
    .range([height, 0]);

  // Update colors
  const fullColors = colorPalettes[currentPalette].colors;
  const range = riskProfiles.map((label, i) => {
    if (label === "No Risk Factors") return fullColors[0];
    return fullColors[i];
  });
  const colorScale = d3.scaleOrdinal().domain(riskProfiles).range(range);

  // Axes
  const yAxis = d3
    .axisLeft(y)
    .ticks(7)
    .tickFormat((d) =>
      metric === "stroke_rate_pct" ? d.toFixed(1) + "%" : d3.format(",")(d),
    );

  svg.append("g").attr("class", "axis axis--y").call(yAxis);

  svg
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("font-size", "0.9rem")
    .style("font-weight", "500");

  // Axis labels
  svg
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 15)
    .attr("text-anchor", "middle")
    .text(
      metric === "stroke_rate_pct"
        ? "Stroke prevalence (%)"
        : "Stroke cases (count)",
    );

  svg
    .append("text")
    .attr("class", "axis-title")
    .attr("x", width / 2)
    .attr("y", height + 50)
    .attr("text-anchor", "middle")
    .text("Age group (years)");

  // Update legend
  updateLegend(svg, riskProfiles, colorScale);

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Bars
  const ageGroup = svg
    .selectAll(".age-group")
    .data(ageGroups)
    .enter()
    .append("g")
    .attr("class", "age-group")
    .attr("transform", (d) => `translate(${x0(d)},0)`);

  ageGroup
    .selectAll(".bar")
    .data((age) => data.filter((d) => d.age_group === age))
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x1(d.risk_profile))
    .attr("width", x1.bandwidth())
    .attr("y", (d) => y(d[metric]))
    .attr("height", (d) => height - y(d[metric]))
    .attr("fill", (d) => colorScale(d.risk_profile))
    .attr("opacity", 0.92)
    .attr("stroke", "#1f2937")
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      d3.select(this).attr("opacity", 1).attr("stroke-width", 1.5);
      tooltip.transition().duration(150).style("opacity", 1);

      const valueStr =
        metric === "stroke_rate_pct"
          ? d[metric].toFixed(2) + " %"
          : d3.format(",")(d[metric]) + " cases";

      tooltip
        .html(
          `<strong>Age:</strong> ${d.age_group}<br>` +
            `<strong>Risk profile:</strong> ${d.risk_profile}<br>` +
            `<strong>${metric === "stroke_rate_pct" ? "Prevalence" : "Stroke cases"}:</strong> ${valueStr}<br>` +
            `<strong>Sample size:</strong> ${d3.format(",")(d.total)}`,
        )
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 12 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 0.92).attr("stroke-width", 0.5);
      tooltip.transition().duration(200).style("opacity", 0);
    });
}

// Setup UI event handlers with complete functionality
function setupRiskProfileControls() {
  const MAX_SELECTIONS = 5;

  // Metric selector
  const metricSelect = document.getElementById("metric-select");
  if (metricSelect) {
    metricSelect.addEventListener("change", (e) => {
      currentMetric = e.target.value;
      renderChart(allRecords, customMode, selectedRiskCombinations);
    });
  }

  // Color palette selector
  const paletteSelect = document.getElementById("palette-select");
  if (paletteSelect) {
    paletteSelect.addEventListener("change", (e) => {
      currentPalette = e.target.value;
      renderChart(allRecords, customMode, selectedRiskCombinations);
      showToast(
        `Switched to ${colorPalettes[currentPalette].name} palette`,
        "info",
      );
    });
  }

  // Panel controls
  const customizeBtn = document.getElementById("customize-risks-btn");
  const panel = document.getElementById("risk-customization-panel");
  const closeBtn = document.getElementById("close-panel-btn");

  if (customizeBtn && panel) {
    // Remove any existing listeners to prevent duplicates
    const newCustomizeBtn = customizeBtn.cloneNode(true);
    customizeBtn.parentNode.replaceChild(newCustomizeBtn, customizeBtn);

    newCustomizeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isHidden =
        panel.style.display === "none" ||
        !panel.style.display ||
        panel.style.display === "";
      panel.style.display = isHidden ? "block" : "none";

      if (isHidden) {
        console.log("Opening customization panel");
        // Ensure panel is above other elements
        panel.style.zIndex = "1000";
        setTimeout(() => setupCheckboxListeners(), 50);
      }
    });
  }

  // if (customizeBtn && panel) {
  //   customizeBtn.addEventListener("click", () => {
  //     const isHidden = panel.style.display === "none";
  //     panel.style.display = isHidden ? "block" : "none";

  //     if (isHidden) {
  //       console.log("Opening customization panel");
  //       setTimeout(() => setupCheckboxListeners(), 50);
  //     }
  //   });
  // }

  if (closeBtn && panel) {
    closeBtn.addEventListener("click", () => {
      panel.style.display = "none";
    });
  }

  // Checkbox event handlers
  function setupCheckboxListeners() {
    const checkboxes = document.querySelectorAll(".risk-checkbox");
    console.log(`Found ${checkboxes.length} checkboxes`);

    if (checkboxes.length === 0) {
      console.error("No checkboxes detected!");
      return;
    }

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("click", function (event) {
        setTimeout(() => {
          const checkedBoxes = document.querySelectorAll(
            ".risk-checkbox:checked",
          );
          const checkedCount = checkedBoxes.length;

          if (checkedCount > MAX_SELECTIONS) {
            event.target.checked = false;
            showToast(
              `You can only select up to ${MAX_SELECTIONS} combinations`,
              "warning",
            );
          }

          updateCheckboxStates();
        }, 10);
      });
    });
  }

  // Update checkbox enabled/disabled state
  function updateCheckboxStates() {
    const checkboxes = document.querySelectorAll(".risk-checkbox");
    const checkedCount = document.querySelectorAll(
      ".risk-checkbox:checked",
    ).length;

    if (checkedCount >= MAX_SELECTIONS) {
      checkboxes.forEach((cb) => {
        if (!cb.checked) {
          cb.disabled = true;
          cb.parentElement.style.opacity = "0.5";
        }
      });
    } else {
      checkboxes.forEach((cb) => {
        cb.disabled = false;
        cb.parentElement.style.opacity = "1";
      });
    }
  }

  setupCheckboxListeners();

  // Apply button
  const applyBtn = document.getElementById("apply-risks-btn");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const selectedCheckboxes = document.querySelectorAll(
        ".risk-checkbox:checked",
      );
      selectedRiskCombinations = Array.from(selectedCheckboxes).map(
        (cb) => cb.value,
      );

      if (selectedRiskCombinations.length === 0) {
        showToast("Please select at least one combination", "warning");
        return;
      }

      if (selectedRiskCombinations.length > MAX_SELECTIONS) {
        showToast(`Maximum ${MAX_SELECTIONS} combinations allowed`, "error");
        return;
      }

      customMode = true;
      const viewText = `${selectedRiskCombinations.length} combination(s) selected`;
      const viewTextElement = document.getElementById("current-view-text");
      if (viewTextElement) {
        viewTextElement.textContent = viewText;
      }

      renderChart(allRecords, true, selectedRiskCombinations);
      showToast(
        `Applied ${selectedRiskCombinations.length} combination(s)`,
        "success",
      );

      if (panel) panel.style.display = "none";
    });
  }

  // Reset button
  const resetBtn = document.getElementById("reset-risks-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      customMode = false;
      selectedRiskCombinations = [];

      const checkboxes = document.querySelectorAll(".risk-checkbox");
      checkboxes.forEach((cb) => {
        cb.checked = false;
        cb.disabled = false;
        cb.parentElement.style.opacity = "1";
      });

      const viewTextElement = document.getElementById("current-view-text");
      if (viewTextElement) {
        viewTextElement.textContent = "Default aggregated risk profiles";
      }

      renderChart(allRecords, false, []);
      showToast("View reset to defaults", "info");

      if (panel) panel.style.display = "none";
    });
  }
}

// Toast notification function
function showToast(message, type = "error") {
  let toast = document.querySelector(".toast-notification");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      font-size: 14px;
      font-weight: 600;
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  const colors = {
    error: "#ef4444",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
  };

  const icons = {
    error: "⚠️",
    success: "✓",
    warning: "⚠️",
    info: "ℹ️",
  };

  toast.style.background = colors[type];
  toast.style.color = "white";
  toast.innerHTML = `<span style="margin-right: 8px;">${icons[type]}</span>${message}`;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
  }, 3000);
}

// ===========================
// VIEW 2: GEOGRAPHIC DISPARITIES (Updated from friend)
// ===========================
async function initializeGeographicView() {
  if (!globalData.length) return;

  const container = d3.select("#map-container");
  container.html('<div class="loading"></div>');

  try {
    // Load US states GeoJSON
    if (!stateGeoData) {
      stateGeoData = await d3.json(
        "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json",
      );
    }

    renderGeographicMap();
    setupGeographicControls();
  } catch (error) {
    console.error("Error loading map data:", error);
    container.html(
      '<p style="text-align:center;padding:40px;">Map data unavailable. Showing simulated data.</p>',
    );
    renderSimulatedGeographic();
  }
}

function renderGeographicMap() {
  const container = d3.select("#map-container");
  container.html("");

  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const width =
    container.node().getBoundingClientRect().width - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Calculate comprehensive state-level statistics
  const stateData = d3.rollup(
    globalData,
    (v) => {
      const total = v.length;
      const strokeCases = v.filter((d) => d.has_stroke).length;
      const smokers = v.filter((d) => d.is_smoker).length;
      const diabetes = v.filter((d) => d.has_diabetes).length;
      const prediabetes = v.filter((d) => d.has_prediabetes).length;
      const obese = v.filter((d) => d.is_obese).length;
      const heartDisease = v.filter((d) => d.has_heart_disease).length;

      // Calculate average age distribution
      const ageGroups = d3.rollup(
        v,
        (arr) => arr.length,
        (d) => d.age_group,
      );
      const mostCommonAge =
        Array.from(ageGroups.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "N/A";

      // Calculate gender distribution
      const maleCount = v.filter((d) => d.sex === "1").length;
      const femaleCount = v.filter((d) => d.sex === "2").length;

      // Risk factor combinations
      const multipleRisks = v.filter(
        (d) =>
          [d.is_smoker, d.has_diabetes, d.is_obese, d.has_heart_disease].filter(
            Boolean,
          ).length >= 2,
      ).length;

      return {
        total,
        strokeCases,
        strokePrevalence: (strokeCases / total) * 100,
        smokingRate: (smokers / total) * 100,
        diabetesRate: (diabetes / total) * 100,
        prediabetesRate: (prediabetes / total) * 100,
        obesityRate: (obese / total) * 100,
        heartDiseaseRate: (heartDisease / total) * 100,
        multipleRisksRate: (multipleRisks / total) * 100,
        mostCommonAge,
        malePercent: (maleCount / total) * 100,
        femalePercent: (femaleCount / total) * 100,
      };
    },
    (d) => {
      // Normalize state code: remove decimals, convert to integer string
      const stateCode = String(Math.floor(parseFloat(d.state) || 0));
      return stateCode;
    },
  );

  // Get selected indicator
  const indicator =
    document.getElementById("geo-indicator-select")?.value || "stroke";

  // Debug: log state data
  console.log("=== STATE DATA DEBUG ===");
  console.log("State data Map size:", stateData.size);
  console.log(
    "State codes in data:",
    Array.from(stateData.keys()).sort((a, b) => parseInt(a) - parseInt(b)),
  );

  // Determine which metric to use for coloring
  const getMetricValue = (data) => {
    switch (indicator) {
      case "diabetes":
        return data.diabetesRate;
      case "obesity":
        return data.obesityRate;
      case "smoking":
        return data.smokingRate;
      case "heart_disease":
        return data.heartDiseaseRate;
      default:
        return data.strokePrevalence;
    }
  };

  // Get all unique state codes and sort them
  const stateCodes = Array.from(stateData.keys()).sort(
    (a, b) => parseInt(a) - parseInt(b),
  );

  console.log("=== GEOGRAPHIC VIEW ===");
  console.log("Total states in data:", stateCodes.length);
  console.log("Current palette:", currentGeoPalette);
  console.log("State codes:", stateCodes.slice(0, 10), "...");

  // Map palette names to D3 interpolators
  const paletteInterpolators = {
    default: d3.interpolateReds,
    categorical: d3.interpolateRdYlGn,
    warm: d3.interpolateOranges,
    cool: d3.interpolateBlues,
    vibrant: d3.interpolatePlasma,
    pastel: d3.interpolatePuRd,
  };

  // Create gradient color scale based on health indicator values
  const colorScale = d3
    .scaleSequential()
    .domain([
      0,
      d3.max(Array.from(stateData.values()), (d) => getMetricValue(d)),
    ])
    .interpolator(
      paletteInterpolators[currentGeoPalette] || d3.interpolateReds,
    );

  // Projection
  const projection = d3
    .geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(width * 1.15);

  const path = d3.geoPath().projection(projection);

  // State name mapping
  const stateNames = {
    1: "Alabama",
    2: "Alaska",
    4: "Arizona",
    5: "Arkansas",
    6: "California",
    8: "Colorado",
    9: "Connecticut",
    10: "Delaware",
    11: "DC",
    12: "Florida",
    13: "Georgia",
    15: "Hawaii",
    16: "Idaho",
    17: "Illinois",
    18: "Indiana",
    19: "Iowa",
    20: "Kansas",
    21: "Kentucky",
    22: "Louisiana",
    23: "Maine",
    24: "Maryland",
    25: "Massachusetts",
    26: "Michigan",
    27: "Minnesota",
    28: "Mississippi",
    29: "Missouri",
    30: "Montana",
    31: "Nebraska",
    32: "Nevada",
    33: "New Hampshire",
    34: "New Jersey",
    35: "New Mexico",
    36: "New York",
    37: "North Carolina",
    38: "North Dakota",
    39: "Ohio",
    40: "Oklahoma",
    41: "Oregon",
    42: "Pennsylvania",
    44: "Rhode Island",
    45: "South Carolina",
    46: "South Dakota",
    47: "Tennessee",
    48: "Texas",
    49: "Utah",
    50: "Vermont",
    51: "Virginia",
    53: "Washington",
    54: "West Virginia",
    55: "Wisconsin",
    56: "Wyoming",
  };

  // Tooltip with enhanced styling
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip tooltip-enhanced")
    .style("opacity", 0);

  // Draw states
  if (stateGeoData) {
    const states = topojson.feature(stateGeoData, stateGeoData.objects.states);

    svg
      .selectAll(".state")
      .data(states.features)
      .enter()
      .append("path")
      .attr("class", "state")
      .attr("d", path)
      .attr("fill", (d) => {
        // Normalize TopoJSON state ID to match our data format
        const stateCode = String(Math.floor(parseFloat(d.id) || 0));
        const data = stateData.get(stateCode);

        // Use metric value for red gradient (darker = higher prevalence)
        return data ? colorScale(getMetricValue(data)) : "#e5e7eb";
      })
      .attr("opacity", 0.85)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        const stateCode = String(Math.floor(parseFloat(d.id) || 0));
        const data = stateData.get(stateCode);

        if (!data) return; // Can't select states with no data

        // Handle state selection for comparison
        handleStateClick(stateCode, d3.select(this), stateNames);
      })

      .on("mouseover", function (event, d) {
        // d3.select(this).attr("opacity", 1).attr("stroke-width", 2.5);
        // Highlight on hover
        if (!d3.select(this).classed("selected-for-comparison")) {
          d3.select(this).attr("opacity", 1).attr("stroke-width", 2.5);
        }

        // Normalize TopoJSON state ID
        const stateCode = String(Math.floor(parseFloat(d.id) || 0));
        const data = stateData.get(stateCode);
        const stateName =
          stateNames[stateCode] || d.properties?.name || `State ${stateCode}`;

        if (!data) {
          tooltip.transition().duration(200).style("opacity", 0.9);
          tooltip
            .html(
              `
            <div style="min-width: 200px;">
              <strong style="color: #dc2626;">⚠️ ${stateName}</strong><br/>
              <span style="font-size: 0.85rem;">No data available for this state in the dataset.</span><br/>
              <span style="font-size: 0.75rem; color: #6b7280;">State Code: ${stateCode}</span>
            </div>
          `,
            )
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 50 + "px");
          return;
        }

        if (data) {
          // Enhanced tooltip with click instruction when in comparison mode
          const comparisonHint = comparisonMode
            ? `<div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #10b981; text-align: center;">
                <span style="color: #10b981; font-weight: 700; font-size: 0.9rem;">
                  👆 Click to select for comparison
                </span>
              </div>`
            : "";

          tooltip.transition().duration(200).style("opacity", 0.95);
          tooltip
            .html(
              `
            <div style="min-width: 280px;">
              <div style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); 
                          color: white; padding: 12px; margin: -10px -14px 10px -14px; 
                          border-radius: 6px 6px 0 0; font-weight: 700; font-size: 1rem;">
                📍 ${stateName}
              </div>
              
              <div style="margin-bottom: 12px;">
                <strong style="color: #0d9488; font-size: 0.9rem;">📊 POPULATION</strong><br/>
                <span style="font-size: 0.85rem;">Total Respondents: <strong>${data.total.toLocaleString()}</strong></span><br/>
                <span style="font-size: 0.85rem;">Most Common Age: <strong>${data.mostCommonAge}</strong></span><br/>
                
              </div>
              
              <div style="margin-bottom: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <strong style="color: #dc2626; font-size: 0.9rem;">❤️ HEALTH CONDITIONS</strong><br/>
                <span style="font-size: 0.85rem;">🔴 Stroke: <strong>${data.strokePrevalence.toFixed(2)}%</strong> (${data.strokeCases} cases)</span><br/>
                <span style="font-size: 0.85rem;">💔 Heart Disease: <strong>${data.heartDiseaseRate.toFixed(2)}%</strong></span><br/>
                <span style="font-size: 0.85rem;">🩸 Diabetes: <strong>${data.diabetesRate.toFixed(2)}%</strong></span><br/>
                <span style="font-size: 0.85rem;">⚠️ Prediabetes: <strong>${data.prediabetesRate.toFixed(2)}%</strong></span>
              </div>
              
              <div style="margin-bottom: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <strong style="color: #ea580c; font-size: 0.9rem;">⚡ RISK FACTORS</strong><br/>
                <span style="font-size: 0.85rem;">🚬 Smoking: <strong>${data.smokingRate.toFixed(2)}%</strong></span><br/>
                <span style="font-size: 0.85rem;">⚖️ Obesity: <strong>${data.obesityRate.toFixed(2)}%</strong></span><br/>
                <span style="font-size: 0.85rem;">🔄 Multiple Risks (2+): <strong>${data.multipleRisksRate.toFixed(2)}%</strong></span>
              </div>
                            ${comparisonHint}

            </div>
          `,
            )
            .style("left", event.pageX + 15 + "px")
            .style("top", event.pageY - 150 + "px");
        }
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 150 + "px");
      })
      .on("mouseout", function () {
        //  d3.select(this).attr("opacity", 0.85).attr("stroke-width", 1);
        // Don't reset opacity if state is selected
        if (!d3.select(this).classed("selected-for-comparison")) {
          d3.select(this).attr("opacity", 0.85).attr("stroke-width", 1);
        }

        tooltip.transition().duration(500).style("opacity", 0);
      });
  }

  // Add legend
  addColorLegend(svg, colorScale, width, height);
}

function renderSimulatedGeographic() {
  const container = d3.select("#map-container");
  container.html("");

  // State name mapping
  const stateNames = {
    1: "Alabama",
    2: "Alaska",
    4: "Arizona",
    5: "Arkansas",
    6: "California",
    8: "Colorado",
    9: "Connecticut",
    10: "Delaware",
    11: "DC",
    12: "Florida",
    13: "Georgia",
    15: "Hawaii",
    16: "Idaho",
    17: "Illinois",
    18: "Indiana",
    19: "Iowa",
    20: "Kansas",
    21: "Kentucky",
    22: "Louisiana",
    23: "Maine",
    24: "Maryland",
    25: "Massachusetts",
    26: "Michigan",
    27: "Minnesota",
    28: "Mississippi",
    29: "Missouri",
    30: "Montana",
    31: "Nebraska",
    32: "Nevada",
    33: "New Hampshire",
    34: "New Jersey",
    35: "New Mexico",
    36: "New York",
    37: "North Carolina",
    38: "North Dakota",
    39: "Ohio",
    40: "Oklahoma",
    41: "Oregon",
    42: "Pennsylvania",
    44: "Rhode Island",
    45: "South Carolina",
    46: "South Dakota",
    47: "Tennessee",
    48: "Texas",
    49: "Utah",
    50: "Vermont",
    51: "Virginia",
    53: "Washington",
    54: "West Virginia",
    55: "Wisconsin",
    56: "Wyoming",
  };

  // Calculate comprehensive state-level statistics
  const stateData = d3.rollup(
    globalData,
    (v) => {
      const total = v.length;
      const strokeCases = v.filter((d) => d.has_stroke).length;
      const smokers = v.filter((d) => d.is_smoker).length;
      const diabetes = v.filter((d) => d.has_diabetes).length;
      const prediabetes = v.filter((d) => d.has_prediabetes).length;
      const obese = v.filter((d) => d.is_obese).length;
      const heartDisease = v.filter((d) => d.has_heart_disease).length;

      const ageGroups = d3.rollup(
        v,
        (arr) => arr.length,
        (d) => d.age_group,
      );
      const mostCommonAge =
        Array.from(ageGroups.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        "N/A";

      const maleCount = v.filter((d) => d.sex === "1").length;
      const femaleCount = v.filter((d) => d.sex === "2").length;

      const multipleRisks = v.filter(
        (d) =>
          [d.is_smoker, d.has_diabetes, d.is_obese, d.has_heart_disease].filter(
            Boolean,
          ).length >= 2,
      ).length;

      return {
        total,
        strokeCases,
        strokePrevalence: (strokeCases / total) * 100,
        smokingRate: (smokers / total) * 100,
        diabetesRate: (diabetes / total) * 100,
        prediabetesRate: (prediabetes / total) * 100,
        obesityRate: (obese / total) * 100,
        heartDiseaseRate: (heartDisease / total) * 100,
        multipleRisksRate: (multipleRisks / total) * 100,
        mostCommonAge,
        malePercent: (maleCount / total) * 100,
        femalePercent: (femaleCount / total) * 100,
      };
    },
    (d) => String(Math.floor(parseFloat(d.state) || 0)),
  );

  const data = Array.from(stateData, ([state, values]) => ({
    state,
    stateName: stateNames[state] || `State ${state}`,
    ...values,
  }))
    .sort((a, b) => b.strokePrevalence - a.strokePrevalence)
    .slice(0, 20);

  const margin = { top: 40, right: 40, bottom: 80, left: 80 };
  const width =
    container.node().getBoundingClientRect().width - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.stateName))
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.strokePrevalence)])
    .nice()
    .range([height, 0]);

  // Map palette names to D3 interpolators
  const paletteInterpolators = {
    default: d3.interpolateReds,
    categorical: d3.interpolateRdYlGn,
    warm: d3.interpolateOranges,
    cool: d3.interpolateBlues,
    vibrant: d3.interpolatePlasma,
    pastel: d3.interpolatePuRd,
  };

  // Use gradient based on selected palette
  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(data, (d) => d.strokePrevalence)])
    .interpolator(
      paletteInterpolators[currentGeoPalette] || d3.interpolateReds,
    );

  // Axes
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g").attr("class", "axis").call(d3.axisLeft(y));

  // Enhanced Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip tooltip-enhanced")
    .style("opacity", 0);

  // Bars
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.stateName))
    .attr("y", (d) => y(d.strokePrevalence))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.strokePrevalence))
    .attr("fill", (d) => colorScale(d.strokePrevalence))
    .attr("opacity", 0.85)
    .on("mouseover", function (event, d) {
      d3.select(this).attr("opacity", 1);
      tooltip.transition().duration(200).style("opacity", 0.95);
      tooltip
        .html(
          `
        <div style="min-width: 280px;">
          <div style="background: linear-gradient(135deg, #0d9488 0%, #059669 100%); 
                      color: white; padding: 12px; margin: -10px -14px 10px -14px; 
                      border-radius: 6px 6px 0 0; font-weight: 700; font-size: 1rem;">
            📍 ${d.stateName}
          </div>
          
          <div style="margin-bottom: 12px;">
            <strong style="color: #0d9488; font-size: 0.9rem;">📊 POPULATION</strong><br/>
            <span style="font-size: 0.85rem;">Total Respondents: <strong>${d.total.toLocaleString()}</strong></span><br/>
            <span style="font-size: 0.85rem;">Most Common Age: <strong>${d.mostCommonAge}</strong></span><br/>
            <span style="font-size: 0.85rem;">Gender: ${d.malePercent.toFixed(1)}% Male, ${d.femalePercent.toFixed(1)}% Female</span>
          </div>
          
          <div style="margin-bottom: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <strong style="color: #dc2626; font-size: 0.9rem;">❤️ HEALTH CONDITIONS</strong><br/>
            <span style="font-size: 0.85rem;">🔴 Stroke: <strong>${d.strokePrevalence.toFixed(2)}%</strong> (${d.strokeCases} cases)</span><br/>
            <span style="font-size: 0.85rem;">💔 Heart Disease: <strong>${d.heartDiseaseRate.toFixed(2)}%</strong></span><br/>
            <span style="font-size: 0.85rem;">🩸 Diabetes: <strong>${d.diabetesRate.toFixed(2)}%</strong></span><br/>
            <span style="font-size: 0.85rem;">⚠️ Prediabetes: <strong>${d.prediabetesRate.toFixed(2)}%</strong></span>
          </div>
          
          <div style="margin-bottom: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <strong style="color: #ea580c; font-size: 0.9rem;">⚡ RISK FACTORS</strong><br/>
            <span style="font-size: 0.85rem;">🚬 Smoking: <strong>${d.smokingRate.toFixed(2)}%</strong></span><br/>
            <span style="font-size: 0.85rem;">⚖️ Obesity: <strong>${d.obesityRate.toFixed(2)}%</strong></span><br/>
            <span style="font-size: 0.85rem;">🔄 Multiple Risks (2+): <strong>${d.multipleRisksRate.toFixed(2)}%</strong></span>
          </div>
        </div>
      `,
        )
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 150 + "px");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 150 + "px");
    })
    .on("mouseout", function () {
      d3.select(this).attr("opacity", 0.85);
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Title
  svg
    .append("text")
    .attr("class", "axis-title")
    .attr("x", width / 2)
    .attr("y", -10)
    .style("text-anchor", "middle")
    .text("Top 20 States by Stroke Prevalence");
}

function setupGeographicControls() {
  const indicatorSelect = document.getElementById("geo-indicator-select");
  const colorSelect = document.getElementById("geo-color-select");

  if (indicatorSelect) {
    indicatorSelect.addEventListener("change", () => {
      console.log("Indicator changed");
      renderGeographicMap();
    });
  }

  if (colorSelect) {
    colorSelect.addEventListener("change", (e) => {
      currentGeoPalette = e.target.value;
      console.log("Color palette changed to:", currentGeoPalette);
      renderGeographicMap();
      showToast(
        `Switched to ${currentGeoPalette.charAt(0).toUpperCase() + currentGeoPalette.slice(1)} palette`,
        "info",
      );
    });
  }

  // State comparison controls
  setupStateComparison();
}

function handleStateClick(stateCode, pathElement, stateNames) {
  if (!comparisonMode) {
    // Not in comparison mode, just show info
    return;
  }

  const stateName = stateNames[stateCode] || `State ${stateCode}`;

  // Check if state is already selected
  const alreadySelected = selectedStatesForComparison.find(
    (s) => s.code === stateCode,
  );

  if (alreadySelected) {
    // Deselect state
    selectedStatesForComparison = selectedStatesForComparison.filter(
      (s) => s.code !== stateCode,
    );
    pathElement
      .classed("selected-for-comparison", false)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.85);

    // Update dropdown
    if (selectedStatesForComparison.length === 0) {
      document.getElementById("compare-state-1").value = "";
      document.getElementById("compare-state-2").value = "";
    } else if (selectedStatesForComparison.length === 1) {
      document.getElementById("compare-state-1").value =
        selectedStatesForComparison[0].code;
      document.getElementById("compare-state-2").value = "";
    }

    showToast(`${stateName} deselected`, "info");
    return;
  }

  // Can't select more than 2 states
  if (selectedStatesForComparison.length >= 2) {
    showToast(
      "Maximum 2 states can be selected. Deselect a state first.",
      "warning",
    );
    return;
  }

  // Select state
  selectedStatesForComparison.push({ code: stateCode, name: stateName });

  // Visual feedback
  pathElement
    .classed("selected-for-comparison", true)
    .attr("stroke", "#10b981")
    .attr("stroke-width", 3)
    .attr("opacity", 1);

  // Update dropdowns
  const state1Select = document.getElementById("compare-state-1");
  const state2Select = document.getElementById("compare-state-2");

  if (selectedStatesForComparison.length === 1) {
    state1Select.value = selectedStatesForComparison[0].code;
  } else if (selectedStatesForComparison.length === 2) {
    state1Select.value = selectedStatesForComparison[0].code;
    state2Select.value = selectedStatesForComparison[1].code;
  }

  showToast(
    `${stateName} selected (${selectedStatesForComparison.length}/2)`,
    "success",
  );

  // Auto-generate comparison if 2 states selected
  if (selectedStatesForComparison.length === 2) {
    setTimeout(() => {
      renderStateComparison(
        selectedStatesForComparison[0].code,
        selectedStatesForComparison[1].code,
        stateNames,
      );
    }, 500);
  }
}

function setupStateComparison() {
  const compareBtn = document.getElementById("compare-states-btn");
  const comparisonPanel = document.getElementById("state-comparison-panel");
  const closeBtn = document.getElementById("close-comparison-btn");
  const resetComBtn = document.getElementById("reset-comparison-btn");
  const applyBtn = document.getElementById("apply-comparison-btn");
  const state1Select = document.getElementById("compare-state-1");
  const state2Select = document.getElementById("compare-state-2");

  // State name mapping
  const stateNames = {
    1: "Alabama",
    2: "Alaska",
    4: "Arizona",
    5: "Arkansas",
    6: "California",
    8: "Colorado",
    9: "Connecticut",
    10: "Delaware",
    11: "DC",
    12: "Florida",
    13: "Georgia",
    15: "Hawaii",
    16: "Idaho",
    17: "Illinois",
    18: "Indiana",
    19: "Iowa",
    20: "Kansas",
    21: "Kentucky",
    22: "Louisiana",
    23: "Maine",
    24: "Maryland",
    25: "Massachusetts",
    26: "Michigan",
    27: "Minnesota",
    28: "Mississippi",
    29: "Missouri",
    30: "Montana",
    31: "Nebraska",
    32: "Nevada",
    33: "New Hampshire",
    34: "New Jersey",
    35: "New Mexico",
    36: "New York",
    37: "North Carolina",
    38: "North Dakota",
    39: "Ohio",
    40: "Oklahoma",
    41: "Oregon",
    42: "Pennsylvania",
    44: "Rhode Island",
    45: "South Carolina",
    46: "South Dakota",
    47: "Tennessee",
    48: "Texas",
    49: "Utah",
    50: "Vermont",
    51: "Virginia",
    53: "Washington",
    54: "West Virginia",
    55: "Wisconsin",
    56: "Wyoming",
  };

  // Populate state dropdowns
  if (state1Select && state2Select) {
    // Get available states from data
    const stateData = d3.rollup(
      globalData,
      (v) => v.length,
      (d) => String(Math.floor(parseFloat(d.state) || 0)),
    );

    const availableStates = Array.from(stateData.keys())
      .filter((code) => stateNames[code])
      .sort((a, b) => stateNames[a].localeCompare(stateNames[b]));

    availableStates.forEach((code) => {
      const option1 = document.createElement("option");
      option1.value = code;
      option1.textContent = stateNames[code];
      state1Select.appendChild(option1);

      const option2 = document.createElement("option");
      option2.value = code;
      option2.textContent = stateNames[code];
      state2Select.appendChild(option2);
    });
  }

  // Show/hide comparison panel
  if (compareBtn) {
    compareBtn.addEventListener("click", () => {
      comparisonPanel.style.display = "block";
      document.getElementById("comparison-results").style.display = "none";

      // Enable comparison mode
      comparisonMode = true;
      selectedStatesForComparison = [];

      // Clear visual selections on map
      d3.selectAll(".state")
        .classed("selected-for-comparison", false)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .attr("opacity", 0.85);

      // Update button text to indicate active mode
      compareBtn.textContent = "🔍 Comparison Mode: ON";
      compareBtn.style.background =
        "linear-gradient(135deg, #10b981 0%, #059669 100%)";

      showToast(
        "Click on states in the map to select them for comparison",
        "info",
      );
    });
  }

  if (resetComBtn) {
    resetComBtn.addEventListener("click", () => {
      comparisonPanel.style.display = "none";

      // Disable comparison mode
      // comparisonMode = false;
      selectedStatesForComparison = [];

      // Clear visual selections on map
      d3.selectAll(".state")
        .classed("selected-for-comparison", false)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .attr("opacity", 0.85);

      // Reset button text
      if (compareBtn) {
        compareBtn.textContent = "🔍 Compare States";
        compareBtn.style.background =
          "linear-gradient(135deg, #10b981 0%, #0d9488 100%)";
      }

      // Clear dropdowns
      state1Select.value = "";
      state2Select.value = "";
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      comparisonPanel.style.display = "none";

      // Disable comparison mode
      comparisonMode = false;
      selectedStatesForComparison = [];

      // Clear visual selections on map
      d3.selectAll(".state")
        .classed("selected-for-comparison", false)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .attr("opacity", 0.85);

      // Reset button text
      if (compareBtn) {
        compareBtn.textContent = "🔍 Compare States";
        compareBtn.style.background =
          "linear-gradient(135deg, #10b981 0%, #0d9488 100%)";
      }

      // Clear dropdowns
      state1Select.value = "";
      state2Select.value = "";
    });
  }

  // Handle dropdown changes - sync with map selection
  if (state1Select) {
    state1Select.addEventListener("change", (e) => {
      const stateCode = e.target.value;
      if (!stateCode) return;

      // Update map selection
      updateMapSelection(stateCode, 0, stateNames);
    });
  }

  if (state2Select) {
    state2Select.addEventListener("change", (e) => {
      const stateCode = e.target.value;
      if (!stateCode) return;

      // Update map selection
      updateMapSelection(stateCode, 1, stateNames);
    });
  }

  // Apply comparison
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const state1 = state1Select.value;
      const state2 = state2Select.value;

      if (!state1 || !state2) {
        showToast("Please select both states to compare", "warning");
        return;
      }

      if (state1 === state2) {
        showToast("Please select two different states", "warning");
        return;
      }

      renderStateComparison(state1, state2, stateNames);
    });
  }
}

function updateMapSelection(stateCode, position, stateNames) {
  // Clear all selections first
  d3.selectAll(".state")
    .classed("selected-for-comparison", false)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1)
    .attr("opacity", 0.85);

  selectedStatesForComparison = [];

  // Get both dropdown values
  const state1 = document.getElementById("compare-state-1").value;
  const state2 = document.getElementById("compare-state-2").value;

  // Add to selection array
  if (state1) {
    selectedStatesForComparison.push({
      code: state1,
      name: stateNames[state1] || `State ${state1}`,
    });
  }
  if (state2 && state2 !== state1) {
    selectedStatesForComparison.push({
      code: state2,
      name: stateNames[state2] || `State ${state2}`,
    });
  }

  // Highlight selected states on map
  selectedStatesForComparison.forEach((state) => {
    d3.selectAll(".state")
      .filter(function (d) {
        const code = String(Math.floor(parseFloat(d.id) || 0));
        return code === state.code;
      })
      .classed("selected-for-comparison", true)
      .attr("stroke", "#10b981")
      .attr("stroke-width", 3)
      .attr("opacity", 1);
  });
}

function renderStateComparison(state1Code, state2Code, stateNames) {
  const resultsContainer = document.getElementById("comparison-results");

  // Calculate state statistics
  const getStateStats = (stateCode) => {
    const stateRecords = globalData.filter(
      (d) => String(Math.floor(parseFloat(d.state) || 0)) === stateCode,
    );

    if (stateRecords.length === 0) return null;

    const total = stateRecords.length;
    return {
      name: stateNames[stateCode] || `State ${stateCode}`,
      total,
      strokeRate:
        (stateRecords.filter((d) => d.has_stroke).length / total) * 100,
      diabetesRate:
        (stateRecords.filter((d) => d.has_diabetes).length / total) * 100,
      obesityRate:
        (stateRecords.filter((d) => d.is_obese).length / total) * 100,
      smokingRate:
        (stateRecords.filter((d) => d.is_smoker).length / total) * 100,
      heartDiseaseRate:
        (stateRecords.filter((d) => d.has_heart_disease).length / total) * 100,
      prediabetesRate:
        (stateRecords.filter((d) => d.has_prediabetes).length / total) * 100,
      multipleRisksRate:
        (stateRecords.filter(
          (d) =>
            [
              d.is_smoker,
              d.has_diabetes,
              d.is_obese,
              d.has_heart_disease,
            ].filter(Boolean).length >= 2,
        ).length /
          total) *
        100,
    };
  };

  const state1Data = getStateStats(state1Code);
  const state2Data = getStateStats(state2Code);

  if (!state1Data || !state2Data) {
    resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 30px; color: #dc2626;">
        <h4>⚠️ Error</h4>
        <p>Unable to retrieve data for selected states.</p>
      </div>
    `;
    resultsContainer.style.display = "block";
    return;
  }

  // Helper function to get severity class
  const getSeverityClass = (value) => {
    if (value >= 15) return "high";
    if (value >= 8) return "medium";
    return "low";
  };

  // Helper function to determine winner (lower is better for health metrics)
  const getWinner = (val1, val2) => {
    if (Math.abs(val1 - val2) < 0.5) return "tie";
    return val1 < val2 ? "state1" : "state2";
  };

  // Calculate summary
  const metrics = [
    { key: "strokeRate", label: "Stroke" },
    { key: "diabetesRate", label: "Diabetes" },
    { key: "obesityRate", label: "Obesity" },
    { key: "smokingRate", label: "Smoking" },
    { key: "heartDiseaseRate", label: "Heart Disease" },
  ];

  let state1Wins = 0;
  let state2Wins = 0;

  metrics.forEach((metric) => {
    const winner = getWinner(state1Data[metric.key], state2Data[metric.key]);
    if (winner === "state1") state1Wins++;
    if (winner === "state2") state2Wins++;
  });

  // Render comparison
  resultsContainer.innerHTML = `
    <div class="comparison-card">
      <div class="comparison-grid">
        <!-- State 1 Column -->
        <div class="state-comparison-column">
          <h4>
            📍 ${state1Data.name}
            ${state1Wins > state2Wins ? '<span class="winner-badge">Better Health</span>' : ""}
          </h4>
          
          <div class="metric-row">
            <span class="metric-label">📊 Sample Size</span>
            <span class="metric-value">${state1Data.total.toLocaleString()}</span>
          </div>
          
          <div style="margin: 20px 0; padding-top: 15px; border-top: 2px solid #e5e7eb;">
            <strong style="color: #0d9488; font-size: 0.9rem;">HEALTH CONDITIONS</strong>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">🔴 Stroke</span>
            <span class="metric-value ${getSeverityClass(state1Data.strokeRate)}">
              ${state1Data.strokeRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">🩸 Diabetes</span>
            <span class="metric-value ${getSeverityClass(state1Data.diabetesRate)}">
              ${state1Data.diabetesRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">💔 Heart Disease</span>
            <span class="metric-value ${getSeverityClass(state1Data.heartDiseaseRate)}">
              ${state1Data.heartDiseaseRate.toFixed(2)}%
            </span>
          </div>
          
          <div style="margin: 20px 0; padding-top: 15px; border-top: 2px solid #e5e7eb;">
            <strong style="color: #0d9488; font-size: 0.9rem;">RISK FACTORS</strong>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">🚬 Smoking</span>
            <span class="metric-value ${getSeverityClass(state1Data.smokingRate)}">
              ${state1Data.smokingRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">⚖️ Obesity</span>
            <span class="metric-value ${getSeverityClass(state1Data.obesityRate)}">
              ${state1Data.obesityRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">⚠️ Prediabetes</span>
            <span class="metric-value ${getSeverityClass(state1Data.prediabetesRate)}">
              ${state1Data.prediabetesRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">🔄 Multiple Risks (2+)</span>
            <span class="metric-value ${getSeverityClass(state1Data.multipleRisksRate)}">
              ${state1Data.multipleRisksRate.toFixed(2)}%
            </span>
          </div>
        </div>

        <!-- State 2 Column -->
        <div class="state-comparison-column">
          <h4>
            📍 ${state2Data.name}
            ${state2Wins > state1Wins ? '<span class="winner-badge">Better Health</span>' : ""}
          </h4>
          
          <div class="metric-row">
            <span class="metric-label">📊 Sample Size</span>
            <span class="metric-value">${state2Data.total.toLocaleString()}</span>
          </div>
          
          <div style="margin: 20px 0; padding-top: 15px; border-top: 2px solid #e5e7eb;">
            <strong style="color: #0d9488; font-size: 0.9rem;">HEALTH CONDITIONS</strong>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">🔴 Stroke</span>
            <span class="metric-value ${getSeverityClass(state2Data.strokeRate)}">
              ${state2Data.strokeRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">🩸 Diabetes</span>
            <span class="metric-value ${getSeverityClass(state2Data.diabetesRate)}">
              ${state2Data.diabetesRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">💔 Heart Disease</span>
            <span class="metric-value ${getSeverityClass(state2Data.heartDiseaseRate)}">
              ${state2Data.heartDiseaseRate.toFixed(2)}%
            </span>
          </div>
          
          <div style="margin: 20px 0; padding-top: 15px; border-top: 2px solid #e5e7eb;">
            <strong style="color: #0d9488; font-size: 0.9rem;">RISK FACTORS</strong>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">🚬 Smoking</span>
            <span class="metric-value ${getSeverityClass(state2Data.smokingRate)}">
              ${state2Data.smokingRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">⚖️ Obesity</span>
            <span class="metric-value ${getSeverityClass(state2Data.obesityRate)}">
              ${state2Data.obesityRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">⚠️ Prediabetes</span>
            <span class="metric-value ${getSeverityClass(state2Data.prediabetesRate)}">
              ${state2Data.prediabetesRate.toFixed(2)}%
            </span>
          </div>
          
          <div class="metric-row">
            <span class="metric-label">🔄 Multiple Risks (2+)</span>
            <span class="metric-value ${getSeverityClass(state2Data.multipleRisksRate)}">
              ${state2Data.multipleRisksRate.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <!-- Summary Section -->
      <div class="comparison-summary">
        <h5>📈 Key Insights</h5>
        
        <div class="summary-item">
          <strong>🏆 Overall Health Comparison:</strong>
          ${
            state1Wins > state2Wins
              ? `${state1Data.name} has better health outcomes in ${state1Wins} out of ${metrics.length} major indicators.`
              : state2Wins > state1Wins
                ? `${state2Data.name} has better health outcomes in ${state2Wins} out of ${metrics.length} major indicators.`
                : "Both states have similar overall health outcomes."
          }
        </div>
        
        <div class="summary-item">
          <strong>📊 Biggest Differences:</strong>
          ${(() => {
            const differences = metrics
              .map((m) => ({
                label: m.label,
                diff: Math.abs(state1Data[m.key] - state2Data[m.key]),
              }))
              .sort((a, b) => b.diff - a.diff);

            return differences[0].diff > 2
              ? `The largest disparity is in ${differences[0].label} prevalence (${differences[0].diff.toFixed(2)}% difference).`
              : "Health metrics are relatively similar between these states.";
          })()}
        </div>
        
        <div class="summary-item">
          <strong>⚠️ Shared Challenges:</strong>
          ${(() => {
            const highMetrics = metrics.filter(
              (m) => state1Data[m.key] >= 10 && state2Data[m.key] >= 10,
            );
            return highMetrics.length > 0
              ? `Both states face elevated rates of ${highMetrics.map((m) => m.label).join(", ")}.`
              : "Both states maintain relatively low prevalence rates across major health indicators.";
          })()}
        </div>
      </div>
    </div>
  `;

  resultsContainer.style.display = "block";

  // Scroll to results
  resultsContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });

  showToast(
    `Comparison generated: ${state1Data.name} vs ${state2Data.name}`,
    "success",
  );
}

function addColorLegend(svg, colorScale, width, height) {
  const legendWidth = 300;
  const legendHeight = 20;

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr(
      "transform",
      `translate(${(width - legendWidth) / 2}, ${height + 40})`,
    );

  const legendScale = d3
    .scaleLinear()
    .domain(colorScale.domain())
    .range([0, legendWidth]);

  const legendAxis = d3
    .axisBottom(legendScale)
    .ticks(5)
    .tickFormat((d) => d.toFixed(1) + "%");

  // Draw gradient
  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient").attr("id", "legend-gradient");

  gradient
    .selectAll("stop")
    .data(d3.range(0, 1.1, 0.1))
    .enter()
    .append("stop")
    .attr("offset", (d) => d * 100 + "%")
    .attr("stop-color", (d) => colorScale(legendScale.invert(d * legendWidth)));

  legend
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#legend-gradient)");

  legend
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);
}

// ===========================
// VIEW 3: DEMOGRAPHIC COMPARISON
// ===========================
function initializeDemographicView() {
  if (!globalData.length) return;

  renderDemographicChart();
  setupDemographicControls();
}

function renderDemographicChart() {
  const container = d3.select("#demographic-container");
  container.html("");

  const factor = document.getElementById("demo-factor-select")?.value || "age";
  const outcome =
    document.getElementById("demo-outcome-select")?.value || "stroke";

  // Aggregate data
  const factorKey = factor === "age" ? "age_group" : factor;
  const outcomeKey =
    outcome === "stroke"
      ? "has_stroke"
      : outcome === "diabetes"
        ? "has_diabetes"
        : outcome === "heart_disease"
          ? "has_heart_disease"
          : "is_obese";

  // Meaningful label mappings
  const factorLabels = {
    age: "Age Group",
    sex: "Gender",
    income: "Income Level",
    education: "Education Level",
    race: "Race/Ethnicity",
  };

  const outcomeLabels = {
    stroke: "Stroke",
    diabetes: "Diabetes",
    heart_disease: "Heart Disease",
    obesity: "Obesity",
  };

  // Category label mappings - Organized by factor type with STRING keys
  const allCategoryLabels = {
    age_group: {
      1: "18-24 years",
      2: "25-34 years",
      3: "35-44 years",
      4: "45-54 years",
      5: "55-64 years",
      6: "65+ years",
    },
    sex: {
      1: "Male",
      2: "Female",
    },
    income: {
      1: "< $15,000",
      2: "$15,000-$25,000",
      3: "$25,000-$35,000",
      4: "$35,000-$50,000",
      5: "$50,000-$75,000",
      6: "$75,000-$100,000",
      7: "$100,000-$200,000",
      8: "$200,000+",
      9: "Unknown",
    },
    education: {
      1: "Did not graduate HS",
      2: "Graduated HS",
      3: "Attended college",
      4: "Graduated college",
      9: "Unknown",
    },
    race: {
      1: "White",
      2: "Black",
      3: "American Indian/Alaska Native",
      4: "Asian",
      5: "Native Hawaiian/Pacific Islander",
      6: "Other race",
      7: "Multiracial",
      8: "Hispanic",
      9: "Unknown",
    },
  };

  // Get the appropriate labels for current factor
  const categoryLabels = allCategoryLabels[factorKey] || {};

  // Define ordering for each demographic factor (min to max)
  const categoryOrders = {
    age_group: ["1", "2", "3", "4", "5", "6"],
    sex: ["1", "2"],
    income: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    education: ["1", "2", "3", "4", "9"],
    race: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  };

  const aggregated = d3.rollup(
    globalData,
    (v) => ({
      cases: v.filter((d) => d[outcomeKey]).length,
      total: v.length,
      prevalence: (v.filter((d) => d[outcomeKey]).length / v.length) * 100,
    }),
    (d) => {
      // Convert to string and remove decimal part (e.g., "6.0" -> "6")
      const rawValue = String(d[factorKey]);
      const cleaned = rawValue.includes(".")
        ? String(Math.floor(parseFloat(rawValue)))
        : rawValue;
      return cleaned;
    },
  );

  // Convert to array
  let data = Array.from(aggregated, ([category, values]) => {
    const categoryStr = String(category);
    return {
      category: categoryStr,
      categoryLabel: categoryLabels[categoryStr] || categoryStr,
      ...values,
    };
  });

  // Sort data according to the defined order (min to max)
  const order = categoryOrders[factorKey] || [];
  if (order.length > 0) {
    // Sort by predefined order
    data.sort((a, b) => {
      const indexA = order.indexOf(a.category);
      const indexB = order.indexOf(b.category);

      // If both found in order array, sort by index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If one not found, put it at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      return 0;
    });
  } else {
    // Fallback: sort alphabetically by label if no order defined
    data.sort((a, b) => a.categoryLabel.localeCompare(b.categoryLabel));
  }

  // Create chart
  const margin = { top: 40, right: 40, bottom: 120, left: 80 };
  const width =
    container.node().getBoundingClientRect().width - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.categoryLabel))
    .range([0, width])
    .padding(0.2);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.prevalence)])
    .nice()
    .range([height, 0]);

  const color = d3
    .scaleOrdinal()
    .domain(data.map((d) => d.categoryLabel))
    .range(COLOR_PALETTES.categorical);

  // Axes
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end")
    .style("font-size", "0.85rem");

  svg.append("g").attr("class", "axis").call(d3.axisLeft(y));

  // Labels
  svg
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", -height / 2)
    .style("text-anchor", "middle")
    .text(`${outcomeLabels[outcome]} Prevalence (%)`);

  svg
    .append("text")
    .attr("class", "axis-title")
    .attr("y", height + 110)
    .attr("x", width / 2)
    .style("text-anchor", "middle")
    .text(
      factorLabels[factor] || factor.charAt(0).toUpperCase() + factor.slice(1),
    );

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Bars
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.categoryLabel))
    .attr("y", (d) => y(d.prevalence))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(d.prevalence))
    .attr("fill", (d) => color(d.categoryLabel))
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `
        <strong>${d.categoryLabel}</strong><br/>
        Prevalence: ${d.prevalence.toFixed(2)}%<br/>
        Cases: ${d.cases.toLocaleString()} / ${d.total.toLocaleString()}
      `,
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });
}

function setupDemographicControls() {
  const factorSelect = document.getElementById("demo-factor-select");
  const outcomeSelect = document.getElementById("demo-outcome-select");

  if (factorSelect) {
    factorSelect.addEventListener("change", renderDemographicChart);
  }

  if (outcomeSelect) {
    outcomeSelect.addEventListener("change", renderDemographicChart);
  }
}

// ===========================
// VIEW 4: RISK CLUSTERING
// ===========================
function initializeCorrelationView() {
  if (!globalData.length) return;

  renderCorrelationChart();
  setupCorrelationControls();
}

function renderCorrelationChart() {
  const container = d3.select("#correlation-container");
  container.html("");

  // Create a correlation heatmap showing risk factor co-occurrence
  const riskFactors = [
    { key: "is_smoker", label: "Smoking" },
    { key: "has_diabetes", label: "Diabetes" },
    { key: "is_obese", label: "Obesity" },
    { key: "has_heart_disease", label: "Heart Disease" },
    { key: "has_stroke", label: "Stroke" },
  ];

  // Calculate correlation matrix
  const correlations = [];
  riskFactors.forEach((factor1) => {
    riskFactors.forEach((factor2) => {
      const both = globalData.filter(
        (d) => d[factor1.key] && d[factor2.key],
      ).length;
      const total = globalData.length;
      const correlation = (both / total) * 100;

      correlations.push({
        factor1: factor1.label,
        factor2: factor2.label,
        value: correlation,
      });
    });
  });

  // Create heatmap
  const margin = { top: 110, right: 40, bottom: 100, left: 120 };
  const width =
    container.node().getBoundingClientRect().width - margin.left - margin.right;
  const cellSize = Math.min(width / riskFactors.length, 100);
  const height = cellSize * riskFactors.length;

  const svg = container
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3
    .scaleBand()
    .domain(riskFactors.map((d) => d.label))
    .range([0, cellSize * riskFactors.length])
    .padding(0.05);

  const y = d3
    .scaleBand()
    .domain(riskFactors.map((d) => d.label))
    .range([0, cellSize * riskFactors.length])
    .padding(0.05);

  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(correlations, (d) => d.value)])
    .interpolator(d3.interpolateBlues);

  // Tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Draw cells
  svg
    .selectAll(".cell")
    .data(correlations)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => x(d.factor2))
    .attr("y", (d) => y(d.factor1))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", (d) => colorScale(d.value))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .style("cursor", "pointer")
    .on("mouseover", function (event, d) {
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `
        <strong>${d.factor1} × ${d.factor2}</strong><br/>
        Co-occurrence: ${d.value.toFixed(2)}%
      `,
        )
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseout", function () {
      tooltip.transition().duration(500).style("opacity", 0);
    });

  // Add text labels
  svg
    .selectAll(".cell-text")
    .data(correlations)
    .enter()
    .append("text")
    .attr("class", "cell-text")
    .attr("x", (d) => x(d.factor2) + x.bandwidth() / 2)
    .attr("y", (d) => y(d.factor1) + y.bandwidth() / 2)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("font-size", "0.8rem")
    .style("fill", (d) => (d.value > 5 ? "white" : "#111"))
    .style("font-weight", "bold")
    .text((d) => d.value.toFixed(1) + "%");

  // Axes
  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,0)`)
    .call(d3.axisTop(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "start");

  svg.append("g").attr("class", "axis").call(d3.axisLeft(y));

  // Title
  svg
    .append("text")
    .attr("class", "axis-title")
    .attr("x", (cellSize * riskFactors.length) / 2)
    .attr("y", -80)
    .style("text-anchor", "middle")
    .style("font-size", "1.1rem")
    .text("Risk Factor Co-occurrence Matrix");
}

function setupCorrelationControls() {
  const primarySelect = document.getElementById("corr-primary-select");
  const secondarySelect = document.getElementById("corr-secondary-select");

  if (primarySelect) {
    primarySelect.addEventListener("change", renderCorrelationChart);
  }

  if (secondarySelect) {
    secondarySelect.addEventListener("change", renderCorrelationChart);
  }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
function showError(message) {
  const container = document.querySelector(
    ".view-container.active .chart-container",
  );
  if (container) {
    container.innerHTML = `
      <div style="text-align:center;padding:60px;color:#ef4444;">
        <h3>⚠️ Error</h3>
        <p>${message}</p>
      </div>
    `;
  }
}

// Handle window resize
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (globalData.length > 0) {
      switch (currentView) {
        case "risk-profile":
          initializeRiskProfileView();
          break;
        case "geographic":
          initializeGeographicView();
          break;
        case "demographic":
          initializeDemographicView();
          break;
        case "correlation":
          initializeCorrelationView();
          break;
      }
    }
  }, 250);
});

console.log("Script initialization complete");
