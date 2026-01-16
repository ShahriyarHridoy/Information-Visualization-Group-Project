# BRFSS Stroke Data Visualization (D3.js)

Interactive multi-view visualization system for exploring BRFSS 2024 health data with focus on stroke risk factors and demographic disparities.

## 📁 Project Structure

```
brfss-stroke-d3/
│
├── index.html                          # Main HTML file
│
├── css/
│   └── style.css                       # All styling and responsive design
│
├── js/
│   └── script.js                       # D3.js visualization logic
│
└── data/
    └── BRFSS_small_25000_data.csv     # BRFSS 2024 dataset
```

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Local web server (required for loading CSV files)

### Installation & Running

1. **Navigate to the project directory:**
   ```bash
   cd brfss-stroke-d3
   ```

2. **Start a local web server:**

   **Option A - Python 3:**
   ```bash
   python -m http.server 8000
   ```

   **Option B - Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Option C - Node.js:**
   ```bash
   npx http-server
   ```

   **Option D - PHP:**
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser:**
   ```
   http://localhost:8000
   ```

## 🎯 Features

### Four Interactive Visualization Views

#### 1. 🎯 Risk Factor Analysis
- Compare stroke prevalence across age groups
- Analyze single, double, and triple risk factor combinations
- Customizable risk profile selection
- Interactive grouped bar charts
- Real-time metric switching (prevalence % vs case counts)

#### 2. 🗺️ Geographic Disparities
- Choropleth map of U.S. states
- State-level health indicator comparison
- Multiple health metrics: stroke, diabetes, obesity, smoking, heart disease
- Interactive tooltips with detailed statistics
- Automatic fallback to bar chart if map data unavailable

#### 3. 👥 Demographic Comparison
- Health outcome analysis by demographics
- Four demographic factors: Age, Income, Education, Race/Ethnicity
- Multiple health outcomes: Stroke, Diabetes, Heart Disease, Obesity
- Bar charts showing prevalence across categories
- Identifies health equity gaps

#### 4. 🔗 Risk Factor Clustering
- Correlation heatmap showing risk factor co-occurrence
- Visual matrix of risk relationships
- Percentage-based co-occurrence statistics
- Interactive cell exploration
- Identifies multimorbidity patterns

## 🎨 Interaction Features

### Navigation
- **Side Panel**: Switch between four visualization views
- **Mobile Toggle**: Show/hide navigation on smaller screens
- **Smooth Transitions**: Animated view changes

### Chart Interactions
- **Hover Tooltips**: Detailed statistics on mouseover
- **Dropdown Controls**: Change metrics, indicators, filters
- **Checkbox Selection**: Customize specific risk combinations
- **Color Palettes**: Six different color schemes
- **Responsive Design**: Adapts to all screen sizes

## 📊 Data Format

### Required CSV Columns

The visualization expects the following BRFSS 2024 columns:

```
_AGE_G          Age group
_STATE          State code
SEX             Sex (1=Male, 2=Female)
INCOME3         Income level
_EDUCAG         Education level
_RACE           Race/Ethnicity
CVDSTRK3        Stroke (1=Yes, 2=No)
_RFSMOK3        Current smoker (1=Yes, 2=No)
DIABETE4        Diabetes (1/2=Yes, 4=No)
PREDIAB2        Prediabetes (1=Yes, 2=No)
_RFBMI5         Obesity BMI≥30 (1=Yes, 2=No)
CVDCRHD4        Heart disease (1=Yes, 2=No)
_BMI5           BMI value
```

### Data Processing

The JavaScript automatically:
- Converts binary outcomes (1=Yes, others=No)
- Aggregates by age groups and risk profiles
- Calculates prevalence rates and case counts
- Handles missing values
- Groups data for different visualization types

## 🎨 Customization

### Color Palettes (6 Options)
1. **Default**: Emerald/Teal gradient
2. **Categorical**: Multi-color for categories
3. **Warm**: Yellow/Orange/Red
4. **Cool**: Blue scale
5. **Vibrant**: High-contrast colors
6. **Pastel**: Soft colors

### Risk Factor Combinations

**Single Risk Factors:**
- No Risk Factors
- Current Smoker
- Diabetes
- Prediabetes
- Obesity (BMI ≥30)
- Heart Disease

**Two-Factor Combinations:**
- Smoker + Diabetes
- Smoker + Obesity
- Smoker + Heart Disease
- Diabetes + Obesity
- Diabetes + Heart Disease
- Obesity + Heart Disease
- And more...

**Three+ Factor Combinations:**
- Smoker + Diabetes + Obesity
- Diabetes + Obesity + Heart Disease
- And more complex combinations...

## 💻 Technical Stack

- **D3.js v7**: Data visualization library
- **TopoJSON**: Geographic data handling
- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with flexbox/grid
- **HTML5**: Semantic markup

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### CSV File Not Loading
**Symptoms**: Empty visualizations or error messages

**Solutions:**
1. Ensure you're using a local web server (not opening HTML directly)
2. Verify CSV filename: `BRFSS_small_25000_data.csv`
3. Check CSV is in `/data/` folder
4. Open browser console (F12) to see error messages
5. Verify CSV has correct column names

### Map Not Displaying
**Symptoms**: Geographic view shows bar chart instead of map

**Solutions:**
1. Check internet connection (TopoJSON loads from CDN)
2. This is expected behavior - system automatically falls back
3. Map requires external TopoJSON data

### Navigation Not Working
**Symptoms**: Can't switch between views

**Solutions:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Check JavaScript console for errors
3. Ensure D3.js library is loading (check Network tab)
4. Try different browser

### Visualizations Look Wrong
**Symptoms**: Misaligned charts, cut-off labels

**Solutions:**
1. Resize browser window to trigger responsive recalculation
2. Refresh page (F5)
3. Check screen resolution compatibility
4. Try zooming out (Ctrl + -)

## 📈 Performance Notes

- **Dataset Size**: Currently using 25,000 records for optimal performance
- **Rendering Time**: ~1-2 seconds for initial load
- **Smooth Interactions**: 60 FPS animations
- **Memory Usage**: ~50-100 MB depending on view

## 🔧 Development

### File Purposes

**index.html**
- Main application structure
- Four view containers
- Side navigation panel
- Control panels for each view

**css/style.css**
- Complete styling system
- Responsive breakpoints (1024px, 768px, 480px)
- Color themes and gradients
- Animation keyframes
- Print styles

**js/script.js**
- Data loading and parsing
- Four visualization implementations
- Navigation logic
- Event handlers
- Tooltip management
- Responsive behavior

**data/BRFSS_small_25000_data.csv**
- Sample BRFSS 2024 data
- Preprocessed and cleaned
- Ready for visualization

### Adding More Data

To use the full BRFSS dataset:

1. Download from: https://www.cdc.gov/brfss/annual_data/annual_2024.html
2. Rename to: `BRFSS_small_25000_data.csv`
3. Replace file in `/data/` folder
4. Refresh browser

**Note**: Larger datasets may require optimization for performance.

## 📚 References

### Data Source
- **CDC BRFSS**: https://www.cdc.gov/brfss/
- **2024 Annual Data**: https://www.cdc.gov/brfss/annual_data/annual_2024.html

### Libraries Used
- **D3.js**: https://d3js.org/
- **TopoJSON**: https://github.com/topojson/topojson

### Academic Context
- **Course**: Data Visualization (TU Wien)
- **Assignment**: Interactive Health Data Visualization
- **Student**: S M Shahriyar (12533559)

## 📄 License

This project is created for educational purposes as part of a university assignment.

## 👤 Author

**S M Shahriyar**  
Student ID: 12533559  
TU Wien

---

## 🎓 Assignment Context

This visualization addresses three main tasks from the project proposal:

1. **Geographic Health Disparities**: Identify and compare health indicators across states
2. **Demographic Disparities**: Investigate health differences across age, income, education, race
3. **Risk Factor Clustering**: Understand how conditions and behaviors co-occur

The system supports multiple user groups:
- Public health officials
- Epidemiologists
- Healthcare administrators
- Researchers
- Policy makers

## 🔮 Future Enhancements

Potential improvements:
- [ ] Export visualizations (SVG, PNG, PDF)
- [ ] Advanced statistical analysis
- [ ] Temporal comparisons (multi-year data)
- [ ] Custom filter builder
- [ ] Data download feature
- [ ] Bookmarking/sharing specific views
- [ ] Accessibility improvements (ARIA labels)
- [ ] Dark mode theme

---

**Last Updated**: January 2025  
**Version**: 1.0.0
