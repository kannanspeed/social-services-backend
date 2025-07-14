const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration for mobile apps and web
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // GitHub Pages
      'https://kannanspeed.github.io',
      // Vercel deployments
      'https://social-4edayhhoq-kannanspeeds-projects.vercel.app',
      // Local development
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      // Expo development
      'http://localhost:19006',
      'http://127.0.0.1:19006'
    ];
    
    // Check if origin is allowed or if it's a Vercel/Render deployment
    if (allowedOrigins.includes(origin) || 
        origin.includes('vercel.app') || 
        origin.includes('render.com') ||
        origin.includes('onrender.com')) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all origins for mobile compatibility
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Data storage files
const DATA_DIR = './data';
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const WORKERS_FILE = path.join(DATA_DIR, 'workers.json');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Initialize data files if they don't exist
const initializeFile = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
};

initializeFile(USERS_FILE);
initializeFile(WORKERS_FILE);
initializeFile(JOBS_FILE);

// Helper functions
const readData = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
};

// API Routes

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Social Services Backend API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            health: '/api/health',
            users: '/api/users',
            workers: '/api/workers',
            jobs: '/api/jobs',
            login: '/api/login'
        }
    });
});

// Users
app.get('/api/users', (req, res) => {
    const users = readData(USERS_FILE);
    res.json(users);
});

app.post('/api/users', (req, res) => {
    const users = readData(USERS_FILE);
    const newUser = {
        ...req.body,
        id: Date.now().toString(),
        joinDate: new Date().toISOString(),
        type: 'user'
    };
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === newUser.email);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    users.push(newUser);
    writeData(USERS_FILE, users);
    res.json({ success: true, user: newUser });
});

// Workers
app.get('/api/workers', (req, res) => {
    const workers = readData(WORKERS_FILE);
    res.json(workers);
});

app.post('/api/workers', (req, res) => {
    const workers = readData(WORKERS_FILE);
    const newWorker = {
        ...req.body,
        id: Date.now().toString(),
        rating: 0,
        totalJobs: 0,
        completedJobs: 0,
        earnings: 0,
        isAvailable: true,
        joinDate: new Date().toISOString(),
        type: 'worker'
    };
    
    // Check if email already exists
    const existingWorker = workers.find(w => w.email === newWorker.email);
    if (existingWorker) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    workers.push(newWorker);
    writeData(WORKERS_FILE, workers);
    res.json({ success: true, user: newWorker });
});

app.put('/api/workers/:id', (req, res) => {
    const workers = readData(WORKERS_FILE);
    const workerIndex = workers.findIndex(w => w.id === req.params.id);
    
    if (workerIndex === -1) {
        return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    
    workers[workerIndex] = { ...workers[workerIndex], ...req.body };
    writeData(WORKERS_FILE, workers);
    res.json({ success: true, user: workers[workerIndex] });
});

// Authentication
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const users = readData(USERS_FILE);
    const workers = readData(WORKERS_FILE);
    
    // Check users first
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        return res.json({ success: true, user });
    }
    
    // Check workers
    const worker = workers.find(w => w.email === email && w.password === password);
    if (worker) {
        return res.json({ success: true, user: worker });
    }
    
    res.status(401).json({ success: false, message: 'Invalid email or password' });
});

// Jobs
app.get('/api/jobs', (req, res) => {
    const jobs = readData(JOBS_FILE);
    res.json(jobs);
});

app.post('/api/jobs', (req, res) => {
    const jobs = readData(JOBS_FILE);
    const newJob = {
        ...req.body,
        id: Date.now().toString(),
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    jobs.push(newJob);
    writeData(JOBS_FILE, jobs);
    
    console.log(`📝 New job created: ${newJob.serviceName} for ${newJob.customerName}`);
    res.json({ success: true, job: newJob });
});

app.put('/api/jobs/:id', (req, res) => {
    const jobs = readData(JOBS_FILE);
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    
    if (jobIndex === -1) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    jobs[jobIndex] = { 
        ...jobs[jobIndex], 
        ...req.body, 
        updatedAt: new Date().toISOString() 
    };
    writeData(JOBS_FILE, jobs);
    
    console.log(`📋 Job updated: ${jobs[jobIndex].id} - Status: ${jobs[jobIndex].status}`);
    res.json({ success: true, job: jobs[jobIndex] });
});

// Get jobs for a specific worker
app.get('/api/jobs/worker/:workerId', (req, res) => {
    const jobs = readData(JOBS_FILE);
    const workers = readData(WORKERS_FILE);
    
    const worker = workers.find(w => w.id === req.params.workerId);
    if (!worker) {
        return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    
    const availableJobs = jobs.filter(job => 
        job.status === 'available' && 
        worker.services.includes(job.service)
    );
    
    const acceptedJobs = jobs.filter(job => 
        job.workerId === req.params.workerId && 
        (job.status === 'accepted' || job.status === 'arrived' || job.status === 'in-progress' || job.status === 'completed' || job.status === 'cancelled')
    );
    
    res.json({ 
        available: availableJobs, 
        accepted: acceptedJobs 
    });
});

// Get jobs for a specific customer
app.get('/api/jobs/customer/:customerId', (req, res) => {
    const jobs = readData(JOBS_FILE);
    const customerJobs = jobs.filter(job => job.customerId === req.params.customerId);
    res.json(customerJobs);
});

// Accept a job
app.post('/api/jobs/:id/accept', (req, res) => {
    const { workerId } = req.body;
    const jobs = readData(JOBS_FILE);
    const workers = readData(WORKERS_FILE);
    
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    const worker = workers.find(w => w.id === workerId);
    
    if (jobIndex === -1) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    if (!worker) {
        return res.status(404).json({ success: false, message: 'Worker not found' });
    }
    
    const job = jobs[jobIndex];
    
    if (job.status !== 'available') {
        return res.status(400).json({ success: false, message: 'Job is no longer available' });
    }
    
    if (!worker.services.includes(job.service)) {
        return res.status(400).json({ success: false, message: 'Worker does not provide this service' });
    }
    
    // Update job
    jobs[jobIndex] = {
        ...job,
        status: 'accepted',
        workerId: workerId,
        workerName: worker.name,
        updatedAt: new Date().toISOString()
    };
    
    // Update worker stats
    const workerIndex = workers.findIndex(w => w.id === workerId);
    workers[workerIndex].totalJobs += 1;
    
    writeData(JOBS_FILE, jobs);
    writeData(WORKERS_FILE, workers);
    
    console.log(`✅ Job ${job.id} accepted by ${worker.name}`);
    res.json({ success: true, job: jobs[jobIndex] });
});

// Worker arrives and generates OTP
app.post('/api/jobs/:id/arrive', (req, res) => {
    const { workerId } = req.body;
    const jobs = readData(JOBS_FILE);
    
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    
    if (jobIndex === -1) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    const job = jobs[jobIndex];
    
    if (job.workerId !== workerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update job status
    jobs[jobIndex] = {
        ...job,
        status: 'arrived',
        otp: otp,
        arrivedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    writeData(JOBS_FILE, jobs);
    
    console.log(`🚗 Worker arrived for job ${job.id}, OTP: ${otp}`);
    res.json({ success: true, otp, job: jobs[jobIndex] });
});

// Verify OTP and start work
app.post('/api/jobs/:id/start', (req, res) => {
    const { otp } = req.body;
    const jobs = readData(JOBS_FILE);
    
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    
    if (jobIndex === -1) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    const job = jobs[jobIndex];
    
    if (job.otp !== otp) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    // Update job status
    jobs[jobIndex] = {
        ...job,
        status: 'in-progress',
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        otp: null // Clear OTP after use
    };
    
    writeData(JOBS_FILE, jobs);
    
    console.log(`🚀 Work started for job ${job.id}`);
    res.json({ success: true, job: jobs[jobIndex] });
});

// Complete work
app.post('/api/jobs/:id/complete', (req, res) => {
    const { workerId } = req.body;
    const jobs = readData(JOBS_FILE);
    const workers = readData(WORKERS_FILE);
    
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    
    if (jobIndex === -1) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    const job = jobs[jobIndex];
    
    if (job.workerId !== workerId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Update job status
    jobs[jobIndex] = {
        ...job,
        status: 'completed',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Update worker stats
    const workerIndex = workers.findIndex(w => w.id === workerId);
    if (workerIndex !== -1) {
        workers[workerIndex].completedJobs += 1;
        workers[workerIndex].earnings += job.price;
    }
    
    writeData(JOBS_FILE, jobs);
    writeData(WORKERS_FILE, workers);
    
    console.log(`✅ Work completed for job ${job.id}`);
    res.json({ success: true, job: jobs[jobIndex] });
});

// Rate worker
app.post('/api/jobs/:id/rate', (req, res) => {
    const { rating, review } = req.body;
    const jobs = readData(JOBS_FILE);
    const workers = readData(WORKERS_FILE);
    
    const jobIndex = jobs.findIndex(j => j.id === req.params.id);
    
    if (jobIndex === -1) {
        return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    const job = jobs[jobIndex];
    
    // Update job with rating
    jobs[jobIndex] = {
        ...job,
        rating: rating,
        review: review,
        ratedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Update worker rating
    const workerIndex = workers.findIndex(w => w.id === job.workerId);
    if (workerIndex !== -1) {
        const workerJobs = jobs.filter(j => j.workerId === job.workerId && j.rating);
        const avgRating = workerJobs.reduce((sum, job) => sum + job.rating, 0) / workerJobs.length;
        workers[workerIndex].rating = Math.round(avgRating * 10) / 10;
    }
    
    writeData(JOBS_FILE, jobs);
    writeData(WORKERS_FILE, workers);
    
    console.log(`⭐ Job ${job.id} rated: ${rating} stars`);
    res.json({ success: true, job: jobs[jobIndex] });
});

// Clear all data (for testing)
app.delete('/api/clear', (req, res) => {
    writeData(USERS_FILE, []);
    writeData(WORKERS_FILE, []);
    writeData(JOBS_FILE, []);
    console.log('🗑️ All data cleared');
    res.json({ success: true, message: 'All data cleared' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        users: readData(USERS_FILE).length,
        workers: readData(WORKERS_FILE).length,
        jobs: readData(JOBS_FILE).length,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Endpoint not found',
        availableEndpoints: [
            'GET /',
            'GET /api/health',
            'POST /api/login',
            'GET /api/users',
            'POST /api/users',
            'GET /api/workers',
            'POST /api/workers',
            'GET /api/jobs',
            'POST /api/jobs'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Social Services Backend running on port ${PORT}`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
    console.log(`📁 Data stored in: ${path.resolve(DATA_DIR)}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; 