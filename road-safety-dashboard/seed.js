require('dotenv').config();
const mongoose = require('mongoose');
const { Accident, ModelMetric } = require('./models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/road_safety_db';

const roadTypes = ['Single carriageway', 'Dual carriageway', 'Roundabout', 'One way street', 'Slip road'];
const junctionControls = ['Uncontrolled', 'Auto traffic signal', 'Stop sign', 'Give way', 'Authorised person'];
const pedestrianControls = ['None within 50m', 'Control by other person', 'Control by school patrol', 'Pedestrian phase at signal'];
const weatherConditions = ['Fine', 'Rain', 'Snow', 'Fog', 'High winds', 'Unknown'];
const lightConditions = ['Daylight', 'Darkness - lit', 'Darkness - unlit', 'Darkness - unknown'];
const speedLimits = [20, 30, 40, 50, 60, 70];
const models = ['TabNet', 'MLP'];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomBetween(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function randomFloat(a, b) { return parseFloat((Math.random() * (b - a) + a).toFixed(4)); }

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  await Accident.deleteMany({});
  await ModelMetric.deleteMany({});

  // Seed model metrics
  await ModelMetric.insertMany([
    { model_name: 'TabNet', accuracy: 0.9721, precision: 0.97, recall: 0.97, f1_score: 0.97, training_accuracy: 0.9753, validation_accuracy: 0.9740, testing_accuracy: 0.9721 },
    { model_name: 'MLP', accuracy: 0.9615, precision: 0.96, recall: 0.96, f1_score: 0.96, training_accuracy: 0.9825, validation_accuracy: 0.9681, testing_accuracy: 0.9615 },
    { model_name: 'Random Forest', accuracy: 0.8594, precision: 0.86, recall: 0.85, f1_score: 0.85, training_accuracy: 0.90, validation_accuracy: 0.87, testing_accuracy: 0.8594 },
    { model_name: 'CNN', accuracy: 0.84, precision: 0.84, recall: 0.83, f1_score: 0.83, training_accuracy: 0.88, validation_accuracy: 0.85, testing_accuracy: 0.84 }
  ]);

  // Seed 500 accidents over 2 years
  const accidents = [];
  const startDate = new Date('2022-01-01');
  const endDate = new Date('2023-12-31');

  for (let i = 0; i < 500; i++) {
    const isFatal = Math.random() < 0.22; // ~22% fatal matching dataset distribution
    const actual = isFatal ? 'Fatal' : 'Non-Fatal';
    const modelUsed = randomFrom(models);
    const tabnetAcc = 0.9721;
    const mlpAcc = 0.9615;
    const acc = modelUsed === 'TabNet' ? tabnetAcc : mlpAcc;
    const correctPrediction = Math.random() < acc;
    const predicted = correctPrediction ? actual : (actual === 'Fatal' ? 'Non-Fatal' : 'Fatal');

    const date = new Date(startDate.getTime() + Math.random() * (endDate - startDate));

    accidents.push({
      accident_id: `ACC-${String(i + 1).padStart(5, '0')}`,
      date,
      severity: actual,
      predicted_severity: predicted,
      confidence: randomFloat(0.72, 0.99),
      road_type: randomFrom(roadTypes),
      junction_control: Math.random() < 0.55 ? 'Uncontrolled' : randomFrom(junctionControls),
      pedestrian_control: Math.random() < 0.60 ? 'None within 50m' : randomFrom(pedestrianControls),
      weather: Math.random() < 0.45 ? 'Fine' : randomFrom(weatherConditions),
      light_condition: randomFrom(lightConditions),
      speed_limit: randomFrom(speedLimits),
      number_of_vehicles: randomBetween(1, 5),
      number_of_casualties: isFatal ? randomBetween(1, 4) : randomBetween(0, 3),
      latitude: randomFloat(51.3, 53.8),
      longitude: randomFloat(-2.5, 0.2),
      urban_or_rural: Math.random() < 0.6 ? 'Urban' : 'Rural',
      model_used: modelUsed
    });
  }

  await Accident.insertMany(accidents);
  console.log(`Seeded ${accidents.length} accidents and 4 model metrics`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

