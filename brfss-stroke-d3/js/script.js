// ===========================
// GLOBAL STATE & CONFIGURATION
// ===========================
let currentView = 'risk-profile';
let globalData = [];
let stateGeoData = null;

// Color palettes
const COLOR_PALETTES = {
  default: ['#10b981', '#0d9488', '#059669', '#047857', '#065f46'],
  categorical: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
  warm: ['#fef3c7', '#fcd34d', '#f59e0b', '#ea580c', '#dc2626'],
  cool: ['#dbeafe', '#60a5fa', '#3b82f6', '#1d4ed8', '#1e3a8a'],
  vibrant: ['#ff006e', '#ff8500', '#ffbe0b', '#06ffa5', '#00b4d8'],
  pastel: ['#ffc9c9', '#b5e7e7', '#d4b5f6', '#ffddb5', '#c9ffc9']
};

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  loadData();
});

// ===========================
// NAVIGATION MANAGEMENT
// ===========================
function initializeNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const toggleBtn = document.getElementById('toggle-btn');
  const sidenav = document.getElementById('sidenav');
  const mainContent = document.getElementById('main-content');

  // View switching
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.getAttribute('data-view');
      switchView(view);
      
      // Update active state
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Close sidebar on mobile
      if (window.innerWidth <= 1024) {
        sidenav.classList.remove('open');
      }
    });
  });

  // Sidebar toggle for mobile
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      sidenav.classList.toggle('open');
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 1024) {
      if (!sidenav.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidenav.classList.remove('open');
      }
    }
  });
}

function switchView(view) {
  currentView = view;
  
  // Hide all views
  document.querySelectorAll('.view-container').forEach(v => {
    v.classList.remove('active');
  });
  
  // Show selected view
  const viewContainer = document.getElementById(`view-${view}`);
  if (viewContainer) {
    viewContainer.classList.add('active');
  }
  
  // Update page title
  const titles = {
    'risk-profile': 'Risk Factor Analysis — BRFSS 2024',
    'geographic': 'Geographic Health Disparities — BRFSS 2024',
    'demographic': 'Demographic Health Comparison — BRFSS 2024',
    'correlation': 'Risk Factor Clustering Analysis — BRFSS 2024'
  };
  
  const subtitles = {
    'risk-profile': 'Interactive visualization with customizable risk factor analysis',
    'geographic': 'Explore state-level health indicator patterns across the United States',
    'demographic': 'Compare health outcomes across demographic groups',
    'correlation': 'Understand how risk factors cluster and co-occur'
  };
  
  document.getElementById('page-title').textContent = titles[view] || titles['risk-profile'];
  document.getElementById('page-subtitle').textContent = subtitles[view] || subtitles['risk-profile'];
  
  // Initialize the appropriate visualization
  if (globalData.length > 0) {
    switch(view) {
      case 'risk-profile':
        initializeRiskProfileView();
        break;
      case 'geographic':
        initializeGeographicView();
        break;
      case 'demographic':
        initializeDemographicView();
        break;
      case 'correlation':
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
    const data = await d3.csv('data/BRFSS_small_25000_data.csv', d => ({
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
      bmi: +d._BMI5 || null
    }));
    
    globalData = data.filter(d => d.age_group);
    
    // Debug: Show state codes in loaded data
    console.log('=== DATA LOADED ===');
    console.log('Total records:', globalData.length);
    const uniqueStates = Array.from(new Set(globalData.map(d => d.state))).sort();
    console.log('Unique states in data:', uniqueStates.length);
    console.log('State codes found:', uniqueStates);
    console.log('Sample records:', globalData.slice(0, 3).map(d => ({
      state: d.state, 
      age: d.age_group, 
      stroke: d.has_stroke
    })));
    
    // Initialize the current view
    initializeRiskProfileView();
    
  } catch (error) {
    console.error('Error loading data:', error);
    showError('Failed to load data. Please check the CSV file.');
  }
}

// ===========================
// VIEW 1: RISK PROFILE ANALYSIS (Original)
// ===========================
function initializeRiskProfileView() {
  if (!globalData.length) return;
  
  // Aggregate data by age and risk factors
  const aggregated = aggregateRiskData(globalData);
  renderRiskProfileChart(aggregated);
  
  // Set up controls
  setupRiskProfileControls();
}

function aggregateRiskData(data) {
  const ageGroups = Array.from(new Set(data.map(d => d.age_group))).sort();
  
  const profiles = [
    { key: 'no_risk_factors', label: 'No Risk Factors', 
      filter: d => !d.is_smoker && !d.has_diabetes && !d.has_prediabetes && !d.is_obese && !d.has_heart_disease },
    { key: 'is_smoker', label: 'Smoker', filter: d => d.is_smoker },
    { key: 'has_diabetes', label: 'Diabetes', filter: d => d.has_diabetes },
    { key: 'is_obese', label: 'Obesity', filter: d => d.is_obese },
    { key: 'has_heart_disease', label: 'Heart Disease', filter: d => d.has_heart_disease },
    { key: '2+ risk factors', label: '2+ Risk Factors', 
      filter: d => [d.is_smoker, d.has_diabetes, d.is_obese, d.has_heart_disease].filter(Boolean).length >= 2 }
  ];
  
  const result = [];
  
  ageGroups.forEach(ageGroup => {
    profiles.forEach(profile => {
      const subset = data.filter(d => d.age_group === ageGroup && profile.filter(d));
      const strokeCases = subset.filter(d => d.has_stroke).length;
      const total = subset.length;
      
      if (total > 0) {
        result.push({
          age_group: ageGroup,
          risk_profile: profile.label,
          stroke_cases: strokeCases,
          total_population: total,
          stroke_rate_pct: (strokeCases / total) * 100
        });
      }
    });
  });
  
  return result;
}

function renderRiskProfileChart(data) {
  const container = d3.select('#chart-container');
  container.html('');
  
  const margin = { top: 40, right: 120, bottom: 80, left: 80 };
  const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;
  
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Get unique age groups and risk profiles
  const ageGroups = Array.from(new Set(data.map(d => d.age_group)));
  const riskProfiles = Array.from(new Set(data.map(d => d.risk_profile)));
  
  // Scales
  const x0 = d3.scaleBand()
    .domain(ageGroups)
    .rangeRound([0, width])
    .paddingInner(0.1);
  
  const x1 = d3.scaleBand()
    .domain(riskProfiles)
    .rangeRound([0, x0.bandwidth()])
    .padding(0.05);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.stroke_rate_pct)])
    .nice()
    .range([height, 0]);
  
  const color = d3.scaleOrdinal()
    .domain(riskProfiles)
    .range(COLOR_PALETTES.default);
  
  // Axes
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');
  
  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y));
  
  // Axis labels
  svg.append('text')
    .attr('class', 'axis-title')
    .attr('transform', 'rotate(-90)')
    .attr('y', -60)
    .attr('x', -height / 2)
    .style('text-anchor', 'middle')
    .text('Stroke Prevalence (%)');
  
  svg.append('text')
    .attr('class', 'axis-title')
    .attr('y', height + 70)
    .attr('x', width / 2)
    .style('text-anchor', 'middle')
    .text('Age Group');
  
  // Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  
  // Bars
  const ageGroup = svg.selectAll('.age-group')
    .data(ageGroups)
    .enter().append('g')
    .attr('transform', d => `translate(${x0(d)},0)`);
  
  ageGroup.selectAll('.bar')
    .data(age => data.filter(d => d.age_group === age))
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x1(d.risk_profile))
    .attr('y', d => y(d.stroke_rate_pct))
    .attr('width', x1.bandwidth())
    .attr('height', d => height - y(d.stroke_rate_pct))
    .attr('fill', d => color(d.risk_profile))
    .on('mouseover', function(event, d) {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`
        <strong>${d.risk_profile}</strong><br/>
        Age: ${d.age_group}<br/>
        Prevalence: ${d.stroke_rate_pct.toFixed(2)}%<br/>
        Cases: ${d.stroke_cases} / ${d.total_population}
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      tooltip.transition().duration(500).style('opacity', 0);
    });
  
  // Legend
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width + 20}, 0)`);
  
  riskProfiles.forEach((profile, i) => {
    const legendRow = legend.append('g')
      .attr('transform', `translate(0, ${i * 25})`);
    
    legendRow.append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', color(profile));
    
    legendRow.append('text')
      .attr('x', 24)
      .attr('y', 14)
      .style('font-size', '0.85rem')
      .text(profile);
  });
}

function setupRiskProfileControls() {
  // Metric selector
  const metricSelect = document.getElementById('metric-select');
  if (metricSelect) {
    metricSelect.addEventListener('change', () => {
      const aggregated = aggregateRiskData(globalData);
      renderRiskProfileChart(aggregated);
    });
  }
  
  // Palette selector
  const paletteSelect = document.getElementById('palette-select');
  if (paletteSelect) {
    paletteSelect.addEventListener('change', () => {
      const aggregated = aggregateRiskData(globalData);
      renderRiskProfileChart(aggregated);
    });
  }
  
  // Customize button
  const customizeBtn = document.getElementById('customize-risks-btn');
  const panel = document.getElementById('risk-customization-panel');
  const closeBtn = document.getElementById('close-panel-btn');
  
  if (customizeBtn) {
    customizeBtn.addEventListener('click', () => {
      panel.style.display = 'block';
    });
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }
}

// ===========================
// VIEW 2: GEOGRAPHIC DISPARITIES
// ===========================
async function initializeGeographicView() {
  if (!globalData.length) return;
  
  const container = d3.select('#map-container');
  container.html('<div class="loading"></div>');
  
  try {
    // Load US states GeoJSON
    if (!stateGeoData) {
      stateGeoData = await d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json');
    }
    
    renderGeographicMap();
    setupGeographicControls();
    
  } catch (error) {
    console.error('Error loading map data:', error);
    container.html('<p style="text-align:center;padding:40px;">Map data unavailable. Showing simulated data.</p>');
    renderSimulatedGeographic();
  }
}

function renderGeographicMap() {
  const container = d3.select('#map-container');
  container.html('');
  
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };
  const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;
  
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  // Calculate comprehensive state-level statistics
  const stateData = d3.rollup(
    globalData,
    v => {
      const total = v.length;
      const strokeCases = v.filter(d => d.has_stroke).length;
      const smokers = v.filter(d => d.is_smoker).length;
      const diabetes = v.filter(d => d.has_diabetes).length;
      const prediabetes = v.filter(d => d.has_prediabetes).length;
      const obese = v.filter(d => d.is_obese).length;
      const heartDisease = v.filter(d => d.has_heart_disease).length;
      
      // Calculate average age distribution
      const ageGroups = d3.rollup(v, arr => arr.length, d => d.age_group);
      const mostCommonAge = Array.from(ageGroups.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      
      // Calculate gender distribution
      const maleCount = v.filter(d => d.sex === '1').length;
      const femaleCount = v.filter(d => d.sex === '2').length;
      
      // Risk factor combinations
      const multipleRisks = v.filter(d => 
        [d.is_smoker, d.has_diabetes, d.is_obese, d.has_heart_disease]
          .filter(Boolean).length >= 2
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
        femalePercent: (femaleCount / total) * 100
      };
    },
    d => String(Math.floor(parseFloat(d.state) || 0)) // Convert state to integer string
  );
  
  // Get selected indicator
  const indicator = document.getElementById('geo-indicator-select')?.value || 'stroke';
  
  // Debug: log state data
  console.log('=== STATE DATA DEBUG ===');
  console.log('State data Map size:', stateData.size);
  console.log('State codes in data:', Array.from(stateData.keys()).sort((a,b) => parseInt(a) - parseInt(b)));
  console.log('First 3 states with full data:', 
    Array.from(stateData.entries()).slice(0, 3).map(([code, data]) => ({
      code, 
      total: data.total,
      stroke: data.strokePrevalence.toFixed(2) + '%'
    }))
  );
  
  // Determine which metric to use for coloring
  const getMetricValue = (data) => {
    switch(indicator) {
      case 'diabetes': return data.diabetesRate;
      case 'obesity': return data.obesityRate;
      case 'smoking': return data.smokingRate;
      case 'heart_disease': return data.heartDiseaseRate;
      default: return data.strokePrevalence;
    }
  };
  
  // Color scale
  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(Array.from(stateData.values()), d => getMetricValue(d))])
    .interpolator(d3.interpolateReds);
  
  // Projection
  const projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(width * 1.2);
  
  const path = d3.geoPath().projection(projection);
  
  // State name mapping (partial - add more as needed)
  const stateNames = {
    '1': 'Alabama', '2': 'Alaska', '4': 'Arizona', '5': 'Arkansas', '6': 'California',
    '8': 'Colorado', '9': 'Connecticut', '10': 'Delaware', '11': 'DC', '12': 'Florida',
    '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois', '18': 'Indiana',
    '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
    '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
    '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
    '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
    '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
    '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
    '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
    '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
    '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'
  };
  
  // Tooltip with enhanced styling
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip tooltip-enhanced')
    .style('opacity', 0);
  
  // Draw states
  if (stateGeoData) {
    const states = topojson.feature(stateGeoData, stateGeoData.objects.states);
    
    svg.selectAll('.state')
      .data(states.features)
      .enter().append('path')
      .attr('class', 'state')
      .attr('d', path)
      .attr('fill', d => {
        const stateCode = d.id;
        const data = stateData.get(stateCode);
        return data ? colorScale(getMetricValue(data)) : '#e5e7eb';
      })
      .on('mouseover', function(event, d) {
        const stateCode = String(d.id); // Convert to string
        const data = stateData.get(stateCode);
        const stateName = stateNames[stateCode] || `State ${stateCode}`;
        
        console.log('Hover - TopoJSON ID:', d.id, 'Type:', typeof d.id);
        console.log('Hover - State Code:', stateCode, 'Data found:', !!data);
        
        if (!data) {
          console.log('⚠️ No data for state code:', stateCode);
          console.log('Available state codes in dataset:', Array.from(stateData.keys()).join(', '));
          // Show a basic message
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip.html(`
            <div style="min-width: 200px;">
              <strong style="color: #dc2626;">⚠️ ${stateName}</strong><br/>
              <span style="font-size: 0.85rem;">No data available for this state in the dataset.</span>
            </div>
          `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 50) + 'px');
          return;
        }
        
        if (data) {
          tooltip.transition().duration(200).style('opacity', 0.95);
          tooltip.html(`
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
                <span style="font-size: 0.85rem;">Gender: ${data.malePercent.toFixed(1)}% Male, ${data.femalePercent.toFixed(1)}% Female</span>
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
            </div>
          `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 150) + 'px');
        }
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 15) + 'px')
          .style('top', (event.pageY - 150) + 'px');
      })
      .on('mouseout', function() {
        tooltip.transition().duration(500).style('opacity', 0);
      });
  }
  
  // Add legend
  addColorLegend(svg, colorScale, width, height);
}

function renderSimulatedGeographic() {
  const container = d3.select('#map-container');
  container.html('');
  
  // State name mapping
  const stateNames = {
    '1': 'Alabama', '2': 'Alaska', '4': 'Arizona', '5': 'Arkansas', '6': 'California',
    '8': 'Colorado', '9': 'Connecticut', '10': 'Delaware', '11': 'DC', '12': 'Florida',
    '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois', '18': 'Indiana',
    '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana', '23': 'Maine',
    '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
    '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska',
    '32': 'Nevada', '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico',
    '36': 'New York', '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio',
    '40': 'Oklahoma', '41': 'Oregon', '42': 'Pennsylvania', '44': 'Rhode Island',
    '45': 'South Carolina', '46': 'South Dakota', '47': 'Tennessee', '48': 'Texas',
    '49': 'Utah', '50': 'Vermont', '51': 'Virginia', '53': 'Washington',
    '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'
  };
  
  // Calculate comprehensive state-level statistics
  const stateData = d3.rollup(
    globalData,
    v => {
      const total = v.length;
      const strokeCases = v.filter(d => d.has_stroke).length;
      const smokers = v.filter(d => d.is_smoker).length;
      const diabetes = v.filter(d => d.has_diabetes).length;
      const prediabetes = v.filter(d => d.has_prediabetes).length;
      const obese = v.filter(d => d.is_obese).length;
      const heartDisease = v.filter(d => d.has_heart_disease).length;
      
      const ageGroups = d3.rollup(v, arr => arr.length, d => d.age_group);
      const mostCommonAge = Array.from(ageGroups.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      
      const maleCount = v.filter(d => d.sex === '1').length;
      const femaleCount = v.filter(d => d.sex === '2').length;
      
      const multipleRisks = v.filter(d => 
        [d.is_smoker, d.has_diabetes, d.is_obese, d.has_heart_disease]
          .filter(Boolean).length >= 2
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
        femalePercent: (femaleCount / total) * 100
      };
    },
    d => String(Math.floor(parseFloat(d.state) || 0)) // Convert state to integer string
  );
  
  const data = Array.from(stateData, ([state, values]) => ({
    state,
    stateName: stateNames[state] || `State ${state}`,
    ...values
  })).sort((a, b) => b.strokePrevalence - a.strokePrevalence).slice(0, 20);
  
  const margin = { top: 40, right: 40, bottom: 80, left: 80 };
  const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;
  
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  const x = d3.scaleBand()
    .domain(data.map(d => d.stateName))
    .range([0, width])
    .padding(0.2);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.strokePrevalence)])
    .nice()
    .range([height, 0]);
  
  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(data, d => d.strokePrevalence)])
    .interpolator(d3.interpolateReds);
  
  // Axes
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');
  
  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y));
  
  // Enhanced Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip tooltip-enhanced')
    .style('opacity', 0);
  
  // Bars
  svg.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.stateName))
    .attr('y', d => y(d.strokePrevalence))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.strokePrevalence))
    .attr('fill', d => colorScale(d.strokePrevalence))
    .on('mouseover', function(event, d) {
      tooltip.transition().duration(200).style('opacity', 0.95);
      tooltip.html(`
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
      `)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 150) + 'px');
    })
    .on('mousemove', function(event) {
      tooltip
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 150) + 'px');
    })
    .on('mouseout', function() {
      tooltip.transition().duration(500).style('opacity', 0);
    });
  
  // Title
  svg.append('text')
    .attr('class', 'axis-title')
    .attr('x', width / 2)
    .attr('y', -10)
    .style('text-anchor', 'middle')
    .text('Top 20 States by Stroke Prevalence');
}

function setupGeographicControls() {
  const indicatorSelect = document.getElementById('geo-indicator-select');
  const colorSelect = document.getElementById('geo-color-select');
  
  if (indicatorSelect) {
    indicatorSelect.addEventListener('change', () => {
      renderGeographicMap();
    });
  }
  
  if (colorSelect) {
    colorSelect.addEventListener('change', () => {
      renderGeographicMap();
    });
  }
}

function addColorLegend(svg, colorScale, width, height) {
  const legendWidth = 300;
  const legendHeight = 20;
  
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${(width - legendWidth) / 2}, ${height + 40})`);
  
  const legendScale = d3.scaleLinear()
    .domain(colorScale.domain())
    .range([0, legendWidth]);
  
  const legendAxis = d3.axisBottom(legendScale)
    .ticks(5)
    .tickFormat(d => d.toFixed(1) + '%');
  
  // Draw gradient
  const defs = svg.append('defs');
  const gradient = defs.append('linearGradient')
    .attr('id', 'legend-gradient');
  
  gradient.selectAll('stop')
    .data(d3.range(0, 1.1, 0.1))
    .enter().append('stop')
    .attr('offset', d => (d * 100) + '%')
    .attr('stop-color', d => colorScale(legendScale.invert(d * legendWidth)));
  
  legend.append('rect')
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .style('fill', 'url(#legend-gradient)');
  
  legend.append('g')
    .attr('transform', `translate(0, ${legendHeight})`)
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
  const container = d3.select('#demographic-container');
  container.html('');
  
  const factor = document.getElementById('demo-factor-select')?.value || 'age';
  const outcome = document.getElementById('demo-outcome-select')?.value || 'stroke';
  
  // Aggregate data
  const factorKey = factor === 'age' ? 'age_group' : factor;
  const outcomeKey = outcome === 'stroke' ? 'has_stroke' : 
                     outcome === 'diabetes' ? 'has_diabetes' :
                     outcome === 'heart_disease' ? 'has_heart_disease' : 'is_obese';
  
  const aggregated = d3.rollup(
    globalData,
    v => ({
      cases: v.filter(d => d[outcomeKey]).length,
      total: v.length,
      prevalence: (v.filter(d => d[outcomeKey]).length / v.length) * 100
    }),
    d => d[factorKey]
  );
  
  const data = Array.from(aggregated, ([category, values]) => ({
    category,
    ...values
  })).sort((a, b) => b.prevalence - a.prevalence);
  
  // Create chart
  const margin = { top: 40, right: 40, bottom: 100, left: 80 };
  const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;
  
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  const x = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, width])
    .padding(0.2);
  
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.prevalence)])
    .nice()
    .range([height, 0]);
  
  const color = d3.scaleOrdinal()
    .domain(data.map(d => d.category))
    .range(COLOR_PALETTES.categorical);
  
  // Axes
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');
  
  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y));
  
  // Labels
  svg.append('text')
    .attr('class', 'axis-title')
    .attr('transform', 'rotate(-90)')
    .attr('y', -60)
    .attr('x', -height / 2)
    .style('text-anchor', 'middle')
    .text(`${outcome.charAt(0).toUpperCase() + outcome.slice(1)} Prevalence (%)`);
  
  svg.append('text')
    .attr('class', 'axis-title')
    .attr('y', height + 80)
    .attr('x', width / 2)
    .style('text-anchor', 'middle')
    .text(factor.charAt(0).toUpperCase() + factor.slice(1));
  
  // Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  
  // Bars
  svg.selectAll('.bar')
    .data(data)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.category))
    .attr('y', d => y(d.prevalence))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.prevalence))
    .attr('fill', d => color(d.category))
    .on('mouseover', function(event, d) {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`
        <strong>${d.category}</strong><br/>
        Prevalence: ${d.prevalence.toFixed(2)}%<br/>
        Cases: ${d.cases} / ${d.total}
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      tooltip.transition().duration(500).style('opacity', 0);
    });
}

function setupDemographicControls() {
  const factorSelect = document.getElementById('demo-factor-select');
  const outcomeSelect = document.getElementById('demo-outcome-select');
  
  if (factorSelect) {
    factorSelect.addEventListener('change', renderDemographicChart);
  }
  
  if (outcomeSelect) {
    outcomeSelect.addEventListener('change', renderDemographicChart);
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
  const container = d3.select('#correlation-container');
  container.html('');
  
  // Create a correlation heatmap showing risk factor co-occurrence
  const riskFactors = [
    { key: 'is_smoker', label: 'Smoking' },
    { key: 'has_diabetes', label: 'Diabetes' },
    { key: 'is_obese', label: 'Obesity' },
    { key: 'has_heart_disease', label: 'Heart Disease' },
    { key: 'has_stroke', label: 'Stroke' }
  ];
  
  // Calculate correlation matrix
  const correlations = [];
  riskFactors.forEach(factor1 => {
    riskFactors.forEach(factor2 => {
      const both = globalData.filter(d => d[factor1.key] && d[factor2.key]).length;
      const total = globalData.length;
      const correlation = (both / total) * 100;
      
      correlations.push({
        factor1: factor1.label,
        factor2: factor2.label,
        value: correlation
      });
    });
  });
  
  // Create heatmap
  const margin = { top: 100, right: 40, bottom: 100, left: 120 };
  const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
  const cellSize = Math.min(width / riskFactors.length, 100);
  const height = cellSize * riskFactors.length;
  
  const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
  
  const x = d3.scaleBand()
    .domain(riskFactors.map(d => d.label))
    .range([0, cellSize * riskFactors.length])
    .padding(0.05);
  
  const y = d3.scaleBand()
    .domain(riskFactors.map(d => d.label))
    .range([0, cellSize * riskFactors.length])
    .padding(0.05);
  
  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(correlations, d => d.value)])
    .interpolator(d3.interpolateBlues);
  
  // Tooltip
  const tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);
  
  // Draw cells
  svg.selectAll('.cell')
    .data(correlations)
    .enter().append('rect')
    .attr('class', 'cell')
    .attr('x', d => x(d.factor2))
    .attr('y', d => y(d.factor1))
    .attr('width', x.bandwidth())
    .attr('height', y.bandwidth())
    .attr('fill', d => colorScale(d.value))
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d) {
      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip.html(`
        <strong>${d.factor1} × ${d.factor2}</strong><br/>
        Co-occurrence: ${d.value.toFixed(2)}%
      `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      tooltip.transition().duration(500).style('opacity', 0);
    });
  
  // Add text labels
  svg.selectAll('.cell-text')
    .data(correlations)
    .enter().append('text')
    .attr('class', 'cell-text')
    .attr('x', d => x(d.factor2) + x.bandwidth() / 2)
    .attr('y', d => y(d.factor1) + y.bandwidth() / 2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .style('font-size', '0.8rem')
    .style('fill', d => d.value > 5 ? 'white' : '#111')
    .style('font-weight', 'bold')
    .text(d => d.value.toFixed(1) + '%');
  
  // Axes
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,0)`)
    .call(d3.axisTop(x))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'start');
  
  svg.append('g')
    .attr('class', 'axis')
    .call(d3.axisLeft(y));
  
  // Title
  svg.append('text')
    .attr('class', 'axis-title')
    .attr('x', (cellSize * riskFactors.length) / 2)
    .attr('y', -60)
    .style('text-anchor', 'middle')
    .style('font-size', '1.1rem')
    .text('Risk Factor Co-occurrence Matrix');
}

function setupCorrelationControls() {
  const primarySelect = document.getElementById('corr-primary-select');
  const secondarySelect = document.getElementById('corr-secondary-select');
  
  if (primarySelect) {
    primarySelect.addEventListener('change', renderCorrelationChart);
  }
  
  if (secondarySelect) {
    secondarySelect.addEventListener('change', renderCorrelationChart);
  }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
function showError(message) {
  const container = document.querySelector('.view-container.active .chart-container');
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
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (globalData.length > 0) {
      switch(currentView) {
        case 'risk-profile':
          initializeRiskProfileView();
          break;
        case 'geographic':
          initializeGeographicView();
          break;
        case 'demographic':
          initializeDemographicView();
          break;
        case 'correlation':
          initializeCorrelationView();
          break;
      }
    }
  }, 250);
});
