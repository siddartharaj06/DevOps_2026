const mongoose = require('mongoose');

const accidentSchema = new mongoose.Schema({
  accident_id: { type: String, required: true, unique: true },
  date: { type: Date, required: true },
  severity: { type: String, enum: ['Fatal', 'Non-Fatal'], required: true },
  predicted_severity: { type: String, enum: ['Fatal', 'Non-Fatal'] },
  confidence: { type: Number, min: 0, max: 1 },
  road_type: { type: String, enum: ['Single carriageway', 'Dual carriageway', 'Roundabout', 'One way street', 'Slip road'] },
  junction_control: { type: String, enum: ['Uncontrolled', 'Auto traffic signal', 'Stop sign', 'Give way', 'Authorised person'] },
  pedestrian_control: { type: String, enum: ['None within 50m', 'Control by other person', 'Control by school patrol', 'Pedestrian phase at signal'] },
  weather: { type: String, enum: ['Fine', 'Rain', 'Snow', 'Fog', 'High winds', 'Unknown'] },
  light_condition: { type: String, enum: ['Daylight', 'Darkness - lit', 'Darkness - unlit', 'Darkness - unknown'] },
  speed_limit: { type: Number },
  number_of_vehicles: { type: Number },
  number_of_casualties: { type: Number },
  latitude: { type: Number },
  longitude: { type: Number },
  urban_or_rural: { type: String, enum: ['Urban', 'Rural'] },
  model_used: { type: String, enum: ['TabNet', 'MLP'], default: 'TabNet' }
}, { timestamps: true });

const modelMetricSchema = new mongoose.Schema({
  model_name: { type: String, required: true },
  accuracy: { type: Number },
  precision: { type: Number },
  recall: { type: Number },
  f1_score: { type: Number },
  training_accuracy: { type: Number },
  validation_accuracy: { type: Number },
  testing_accuracy: { type: Number },
  recorded_at: { type: Date, default: Date.now }
});

const Accident = mongoose.model('Accident', accidentSchema);
const ModelMetric = mongoose.model('ModelMetric', modelMetricSchema);

module.exports = { Accident, ModelMetric };
