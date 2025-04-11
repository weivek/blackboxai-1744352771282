const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Load voters and votes data
let db = {
    voters: [],
    votes: {}
};

// Load existing data from db.json
if (fs.existsSync('db.json')) {
    db = JSON.parse(fs.readFileSync('db.json'));
}

// Register a new voter
app.post('/api/register', (req, res) => {
    const { aadhar, name, dob, address, fingerprint } = req.body;
    if (!aadhar || !name || !dob || !address || !fingerprint) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (db.voters.find(voter => voter.aadhar === aadhar)) {
        return res.status(400).json({ message: 'Aadhar number already registered.' });
    }
    const newVoter = { aadhar, name, dob, address, fingerprint };
    db.voters.push(newVoter);
    fs.writeFileSync('db.json', JSON.stringify(db));
    res.status(201).json({ message: 'Voter registered successfully.' });
});

// Verify fingerprint
app.post('/api/verify', (req, res) => {
    const { fingerprint } = req.body;
    const voter = db.voters.find(voter => voter.fingerprint === fingerprint);
    if (voter) {
        res.json({ message: 'Verification successful.', voter });
    } else {
        res.status(404).json({ message: 'Voter not found.' });
    }
});

// Get candidates
app.get('/api/candidates', (req, res) => {
    const candidates = [
        { id: 1, name: 'Candidate A', image: 'https://example.com/candidate-a.jpg' },
        { id: 2, name: 'Candidate B', image: 'https://example.com/candidate-b.jpg' }
    ];
    res.json(candidates);
});

// Vote for a candidate
app.post('/api/vote', (req, res) => {
    const { voterId, candidateId } = req.body;
    if (!voterId || !candidateId) {
        return res.status(400).json({ message: 'Voter ID and Candidate ID are required.' });
    }
    if (!db.votes[voterId]) {
        db.votes[voterId] = candidateId;
        fs.writeFileSync('db.json', JSON.stringify(db));
        res.json({ message: 'Vote recorded successfully.' });
    } else {
        res.status(400).json({ message: 'Vote already cast.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
