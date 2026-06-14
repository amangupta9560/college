import mongoose from 'mongoose';
import User from './models/User.js';
import Team from './models/Team.js';
import TeamApplication from './models/TeamApplication.js';
import Notification from './models/Notification.js';
import bcrypt from 'bcryptjs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const testPhase2 = async () => {
  console.log('=== HACKMATCH PHASE 2 INTEGRATION TEST SUITE ===\n');

  await delay(3000); // Wait for server to connect
  
  const baseUrl = 'http://localhost:5000/api';
  const emailA = 'studenta@college.edu';
  const emailB = 'studentb@college.edu';
  const password = 'Password123!';

  let tokenA = '';
  let tokenB = '';
  let userA = null;
  let userB = null;
  let teamId = '';
  let appId = '';

  // 1. Cleanup old test users & teams
  try {
    await User.deleteMany({ email: { $in: [emailA, emailB] } });
    await Team.deleteMany({ name: 'Test Team AI' });
    console.log('✓ Cleaned up database test records.');
  } catch (err) {
    console.error('Cleanup failed:', err.message);
  }

  // Helper function to register and verify user
  const registerAndVerify = async (email, firstName, lastName) => {
    // Register
    let res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email, password, firstName, lastName,
        college: 'HIET Ghaziabad', degree: 'B.Tech', branch: 'CSE', year: 3
      })
    });
    
    // Inject OTP directly in database
    const dbUser = await User.findOne({ email });
    const hashedOtp = await bcrypt.hash('123456', 12);
    dbUser.emailOTP = hashedOtp;
    dbUser.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
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

  // 2. Register Student A and Student B
  try {
    const resA = await registerAndVerify(emailA, 'Student', 'A');
    tokenA = resA.token;
    userA = resA.user;
    
    const resB = await registerAndVerify(emailB, 'Student', 'B');
    tokenB = resB.token;
    userB = resB.user;

    console.log('✓ Registered and verified Student A & Student B.');
  } catch (err) {
    console.error('✗ Registration error:', err.message);
    process.exit(1);
  }

  // 3. Student A creates a Team
  try {
    const res = await fetch(`${baseUrl}/teams`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        name: 'Test Team AI',
        description: 'Building an awesome AI project for the campus.',
        projectType: 'hackathon',
        maxSize: 3,
        openRoles: ['Frontend Developer', 'Designer']
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success) {
      teamId = data.data.team._id;
      console.log('✓ Student A created Team "Test Team AI": PASS');
    } else {
      console.log('✗ Student A create team: FAIL', data);
    }
  } catch (err) {
    console.error('✗ Create team error:', err.message);
  }

  // 4. Student B searches for public teams
  try {
    const res = await fetch(`${baseUrl}/teams`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${tokenB}`,
        'Content-Type': 'application/json' 
      }
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.data.teams.length > 0) {
      console.log('✓ Student B listed public teams: PASS');
    } else {
      console.log('✗ Student B list teams: FAIL', data);
    }
  } catch (err) {
    console.error('✗ List teams error:', err.message);
  }

  // 5. Student B applies to Student A's team for "Frontend Developer" role
  try {
    const res = await fetch(`${baseUrl}/applications`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${tokenB}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        teamId,
        role: 'Frontend Developer',
        coverMessage: 'I am highly skilled in React.'
      })
    });
    const data = await res.json();
    if (res.status === 201 && data.success) {
      appId = data.data.application._id;
      console.log('✓ Student B applied to team: PASS');
    } else {
      console.log('✗ Student B application: FAIL', data);
    }
  } catch (err) {
    console.error('✗ Submit application error:', err.message);
  }

  // 6. Verify notification was created for Student A (Leader)
  try {
    const notifs = await Notification.find({ recipient: userA._id });
    if (notifs.length > 0 && notifs[0].type === 'application') {
      console.log('✓ Leader received application notification: PASS');
    } else {
      console.log('✗ Leader notification check: FAIL');
    }
  } catch (err) {
    console.error('✗ Notification check error:', err.message);
  }

  // 7. Student A (Leader) accepts Student B's application
  try {
    const res = await fetch(`${baseUrl}/applications/${appId}/accept`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${tokenA}`,
        'Content-Type': 'application/json' 
      }
    });
    const data = await res.json();
    if (res.status === 200 && data.success) {
      console.log('✓ Leader accepted application: PASS');
    } else {
      console.log('✗ Accept application: FAIL', data);
    }
  } catch (err) {
    console.error('✗ Accept application error:', err.message);
  }

  // 8. Verify Student B is in the team roster
  try {
    const updatedTeam = await Team.findById(teamId);
    const inRoster = updatedTeam.members.some(m => m.user.toString() === userB._id.toString());
    if (inRoster) {
      console.log('✓ Student B added to team roster: PASS');
    } else {
      console.log('✗ Roster verification: FAIL');
    }
  } catch (err) {
    console.error('✗ Roster verification error:', err.message);
  }

  // 9. Cleanup
  console.log('\n=== CLEANING UP ===');
  try {
    await User.deleteMany({ email: { $in: [emailA, emailB] } });
    await Team.deleteOne({ _id: teamId });
    await TeamApplication.deleteOne({ _id: appId });
    await Notification.deleteMany({ recipient: { $in: [userA._id, userB._id] } });
    console.log('✓ Integration test records deleted from database.');
    mongoose.connection.close();
    console.log('✓ Mongoose connection closed.');
    console.log('\n=== PHASE 2 INTEGRATION TESTS COMPLETED ===');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err.message);
    process.exit(1);
  }
};

// Start Express app and run tests
import('./index.js').then(() => {
  testPhase2();
});
