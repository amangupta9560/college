import mongoose from 'mongoose';
import User from './models/User.js';
import Team from './models/Team.js';
import Project from './models/Project.js';
import Review from './models/Review.js';
import Report from './models/Report.js';
import Hackathon from './models/Hackathon.js';
import bcrypt from 'bcryptjs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testPhase3 = async () => {
  console.log('=== HACKMATCH PHASE 3 INTEGRATION TEST SUITE ===\n');

  await delay(3000); // Wait for server & DB connection
  
  const baseUrl = 'http://localhost:5000/api';
  const organizerEmail = 'organizer@college.edu';
  const studentEmail = 'student@college.edu';
  const password = 'Password123!';

  let orgToken = '';
  let studentToken = '';
  let orgUser = null;
  let studentUser = null;
  
  let hackathonId = '';
  let projectId = '';
  let teamId = '';
  let reviewId = '';
  let reportId = '';

  // 1. Cleanup old test data
  try {
    await User.deleteMany({ email: { $in: [organizerEmail, studentEmail] } });
    await Hackathon.deleteMany({ title: 'Test Hackathon 2026' });
    await Project.deleteMany({ title: 'Test Project Phase 3' });
    await Team.deleteMany({ name: 'Test Team Phase 3' });
    console.log('✓ Cleaned up old database test records.');
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }

  // Helper function to register and verify user
  const registerAndVerify = async (email, firstName, lastName, role = 'student') => {
    // Register
    let res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, password, firstName, lastName,
        college: 'HIET Ghaziabad', degree: 'B.Tech', branch: 'CSE', year: 3, role
      })
    });
    
    // Inject OTP directly in database
    const dbUser = await User.findOne({ email });
    const hashedOtp = await bcrypt.hash('123456', 12);
    dbUser.emailOTP = hashedOtp;
    dbUser.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    dbUser.role = role; // Set role
    await dbUser.save();

    // Verify OTP
    res = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp: '123456' })
    });
    const data = await res.json();
    return { token: data.data.accessToken, user: data.data.user };
  };

  // 2. Register Users
  try {
    const orgRes = await registerAndVerify(organizerEmail, 'Organizer', 'User', 'organizer');
    orgToken = orgRes.token;
    orgUser = orgRes.user;

    const studentRes = await registerAndVerify(studentEmail, 'Student', 'User', 'student');
    studentToken = studentRes.token;
    studentUser = studentRes.user;

    console.log('✓ Registered and verified Organizer & Student.');
  } catch (err) {
    console.error('✗ Registration error:', err.message);
    process.exit(1);
  }

  // 3. Organizer creates a Hackathon
  try {
    const res = await fetch(`${baseUrl}/hackathons`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${orgToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        title: 'Test Hackathon 2026',
        description: 'An integration test hackathon for campus builders.',
        mode: 'online',
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        teamSizeMin: 1,
        teamSizeMax: 3,
        prizes: [{ rank: 'Grand Prize', prize: '$1000' }],
        tags: ['Web3', 'AI']
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success) {
      hackathonId = data.data.hackathon._id;
      console.log('✓ Organizer created Hackathon: PASS');
    } else {
      console.log('✗ Organizer created Hackathon: FAIL', data);
    }
  } catch (err) {
    console.error('✗ Hackathon creation error:', err.message);
  }

  // 4. Student creates a Showcase Project
  try {
    const res = await fetch(`${baseUrl}/projects`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        title: 'Test Project Phase 3',
        description: 'Building the best hackathon matching engine.',
        techStack: ['React', 'Express', 'Mongoose'],
        githubURL: 'https://github.com/student/match',
        isPublic: true,
        status: 'completed'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success) {
      projectId = data.data.project._id;
      console.log('✓ Student created Project Showcase: PASS');
    } else {
      console.log('✗ Student created Project Showcase: FAIL', data);
    }
  } catch (err) {
    console.error('✗ Project creation error:', err.message);
  }

  // 5. Create a team and complete it to test teammate review
  try {
    // Create Team
    const res = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        name: 'Test Team Phase 3',
        description: 'Test team description.',
        projectType: 'hackathon',
        maxSize: 3
      })
    });
    const data = await res.json();
    teamId = data.data.team._id;

    // Directly insert Organizer into team membership via Mongoose to bypass invites
    const dbTeam = await Team.findById(teamId);
    dbTeam.members.push({
      user: orgUser._id,
      role: 'Developer',
      joinedAt: new Date()
    });
    // Mark team as completed to make them reviewable
    dbTeam.status = 'completed';
    await dbTeam.save();

    console.log('✓ Setup completed shared team between Student & Organizer: PASS');
  } catch (err) {
    console.error('✗ Team setup error:', err.message);
  }

  // 6. Student registers Team for the Hackathon
  try {
    const res = await fetch(`${baseUrl}/hackathons/${hackathonId}/register`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ teamId })
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log('✓ Student registered Team to Hackathon: PASS');
    } else {
      console.log('✗ Student registered Team to Hackathon: FAIL', data);
    }
  } catch (err) {
    console.error('✗ Hackathon registration error:', err.message);
  }

  // 7. Student submits Review for Teammate (Organizer)
  try {
    const res = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        revieweeId: orgUser._id,
        teamId,
        rating: 5,
        comment: 'Great organizer and team member!',
        tags: ['Reliable', 'Team Player']
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success) {
      reviewId = data.data.review._id;
      console.log('✓ Student submitted review for Organizer: PASS');
    } else {
      console.log('✗ Student review submission: FAIL', data);
    }
  } catch (err) {
    console.error('✗ Review submission error:', err.message);
  }

  // 8. Student submits Report for Organizer profile
  try {
    const res = await fetch(`${baseUrl}/reports`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        targetType: 'user',
        targetId: orgUser._id,
        reason: 'fake',
        description: 'This organizer profile is used for testing.'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success) {
      reportId = data.data.report._id;
      console.log('✓ Student submitted report for Organizer profile: PASS');
    } else {
      console.log('✗ Student report submission: FAIL', data);
    }
  } catch (err) {
    console.error('✗ Report submission error:', err.message);
  }

  // 9. Cleanup database test records
  console.log('\n=== CLEANING UP ===');
  try {
    await User.deleteMany({ email: { $in: [organizerEmail, studentEmail] } });
    await Hackathon.deleteOne({ _id: hackathonId });
    await Project.deleteOne({ _id: projectId });
    await Team.deleteOne({ _id: teamId });
    await Review.deleteOne({ _id: reviewId });
    await Report.deleteOne({ _id: reportId });
    console.log('✓ Integration test records deleted from database.');
    mongoose.connection.close();
    console.log('✓ Mongoose connection closed.');
    console.log('\n=== PHASE 3 INTEGRATION TESTS COMPLETED ===');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err.message);
    process.exit(1);
  }
};

// Import index to boot the database/Express app
import('./index.js').then(() => {
  testPhase3();
});
