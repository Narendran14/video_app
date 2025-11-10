const request = require('supertest');
const app = require('../src/server');
const mongoose = require('mongoose');
const User = require('../src/models/user');
const Video = require('../src/models/video');
const path = require('path');
const fs = require('fs');

let authToken;
let testVideoId;

describe('API Tests', () => {
  // Before all tests, create a test user
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create test user
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'editor',
      tenantId: 'test-tenant'
    };
    
    await User.deleteMany({}); // Clean up users
    await Video.deleteMany({}); // Clean up videos
  });

  // After all tests, clean up
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // Test Authentication
  describe('Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          tenantId: 'test-tenant'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should login user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    });
  });

  // Test Video Operations
  describe('Video Operations', () => {
    it('should upload a video', async () => {
      const res = await request(app)
        .post('/api/videos/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('video', path.resolve(__dirname, './test-video.mp4'))
        .field('title', 'Test Video');
      
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data.video).toHaveProperty('_id');
      testVideoId = res.body.data.video._id;
    });

    it('should list uploaded videos', async () => {
      const res = await request(app)
        .get('/api/videos')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should stream video', async () => {
      const res = await request(app)
        .get(`/api/videos/stream/${testVideoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('video/mp4');
    });

    it('should handle range requests for video streaming', async () => {
      const res = await request(app)
        .get(`/api/videos/stream/${testVideoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Range', 'bytes=0-1024');
      
      expect(res.status).toBe(206);
      expect(res.header['content-range']).toBeDefined();
    });
  });

  // Test Error Cases
  describe('Error Handling', () => {
    it('should handle missing video file', async () => {
      const res = await request(app)
        .post('/api/videos/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .field('title', 'Test Video');
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_FILE');
    });

    it('should handle missing video title', async () => {
      const res = await request(app)
        .post('/api/videos/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('video', path.resolve(__dirname, './test-video.mp4'));
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_TITLE');
    });

    it('should handle invalid video ID for streaming', async () => {
      const res = await request(app)
        .get('/api/videos/stream/invalid-id')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.code).toBe('MISSING_VIDEO_ID');
    });
  });
});