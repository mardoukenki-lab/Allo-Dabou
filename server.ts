import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Allô Dabou VTC API', timestamp: new Date().toISOString() });
  });

  // Notification route when a ride is booked
  app.post('/api/notify-ride', (req, res) => {
    const ride = req.body;
    console.log('🚖 [ALLÔ DABOU DISPATCH NOTIFICATION] New Ride Booked:', {
      id: ride.id,
      pickup: ride.pickupAddress,
      destination: ride.destinationAddress,
      distanceKm: ride.distanceKm,
      priceFcfa: ride.priceFcfa,
      client: ride.userName || ride.userEmail,
      phone: ride.userPhone,
    });

    // Successfully logged/dispatched
    res.json({
      success: true,
      message: 'Notification reçue par l’équipe Allô Dabou VTC.',
      rideId: ride.id,
    });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🟢 Allô Dabou VTC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
