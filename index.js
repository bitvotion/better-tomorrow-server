const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI;

// MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send("Better Tomorrow server is running")
})

async function run() {
    try {
        await client.connect()

        // Send Ping to confirm connection
        await client.db("admin").command({ ping: 1 })
        console.log("Pinged you deployment. Connected to MongoDB");
    }
    finally {

    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`Better Tomorrow server is running on port: ${port}`);
})