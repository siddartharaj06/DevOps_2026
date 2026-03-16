const express = require('express');
const router = express.Router();
const { Accident, ModelMetric } = require('../models');

// GET /api/stats - overview stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Accident.countDocuments();
    const fatal = await Accident.countDocuments({ severity: 'Fatal' });
    const nonFatal = await Accident.countDocuments({ severity: 'Non-Fatal' });

    const correctPredictions = await Accident.countDocuments({
      $expr: { $eq: ['$severity', '$predicted_severity'] }
    });
    const modelAccuracy = total > 0 ? ((correctPredictions / total) * 100).toFixed(2) : 0;

    const avgCasualties = await Accident.aggregate([
      { $group: { _id: null, avg: { $avg: '$number_of_casualties' } } }
    ]);

    res.json({
      total,
      fatal,
      nonFatal,
      fatalRate: total > 0 ? ((fatal / total) * 100).toFixed(1) : 0,
      modelAccuracy,
      avgCasualties: avgCasualties[0]?.avg?.toFixed(2) || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accidents-by-month
router.get('/accidents-by-month', async (req, res) => {
  try {
    const data = await Accident.aggregate([
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          total: { $sum: 1 },
          fatal: { $sum: { $cond: [{ $eq: ['$severity', 'Fatal'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accidents-by-road-type
router.get('/accidents-by-road-type', async (req, res) => {
  try {
    const data = await Accident.aggregate([
      {
        $group: {
          _id: '$road_type',
          total: { $sum: 1 },
          fatal: { $sum: { $cond: [{ $eq: ['$severity', 'Fatal'] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accidents-by-junction
router.get('/accidents-by-junction', async (req, res) => {
  try {
    const data = await Accident.aggregate([
      {
        $group: {
          _id: '$junction_control',
          total: { $sum: 1 },
          fatal: { $sum: { $cond: [{ $eq: ['$severity', 'Fatal'] }, 1, 0] } }
        }
      },
      { $sort: { fatal: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accidents-by-weather
router.get('/accidents-by-weather', async (req, res) => {
  try {
    const data = await Accident.aggregate([
      {
        $group: {
          _id: '$weather',
          total: { $sum: 1 },
          fatal: { $sum: { $cond: [{ $eq: ['$severity', 'Fatal'] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accidents-by-pedestrian-control
router.get('/accidents-by-pedestrian-control', async (req, res) => {
  try {
    const data = await Accident.aggregate([
      {
        $group: {
          _id: '$pedestrian_control',
          total: { $sum: 1 },
          fatal: { $sum: { $cond: [{ $eq: ['$severity', 'Fatal'] }, 1, 0] } }
        }
      },
      { $sort: { fatal: -1, total: -1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/model-metrics
router.get('/model-metrics', async (req, res) => {
  try {
    const data = await ModelMetric.find().sort({ accuracy: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/prediction-accuracy-by-model
router.get('/prediction-accuracy-by-model', async (req, res) => {
  try {
    const data = await Accident.aggregate([
      {
        $group: {
          _id: '$model_used',
          total: { $sum: 1 },
          correct: {
            $sum: { $cond: [{ $eq: ['$severity', '$predicted_severity'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          model: '$_id',
          total: 1,
          correct: 1,
          accuracy: { $multiply: [{ $divide: ['$correct', '$total'] }, 100] }
        }
      }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/severity-by-speed
router.get('/severity-by-speed', async (req, res) => {
  try {
    const data = await Accident.aggregate([
      {
        $group: {
          _id: '$speed_limit',
          total: { $sum: 1 },
          fatal: { $sum: { $cond: [{ $eq: ['$severity', 'Fatal'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/accidents - paginated list
router.get('/accidents', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const severity = req.query.severity;
    const model = req.query.model;

    const filter = {};
    if (severity) filter.severity = severity;
    if (model) filter.model_used = model;

    const total = await Accident.countDocuments(filter);
    const accidents = await Accident.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ accidents, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/accidents - add new accident record
router.post('/accidents', async (req, res) => {
  try {
    const count = await Accident.countDocuments();
    const accident = new Accident({
      accident_id: `ACC-${String(count + 1).padStart(5, '0')}`,
      ...req.body
    });
    await accident.save();
    res.status(201).json(accident);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
