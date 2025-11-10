const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        const db = client.db("better_tomorrow_DB")
        const eventsCollection = db.collection("events")

        // API

        app.post('/events', async (req, res) => {
            const newEvent = req.body
            const result = await eventsCollection.insertOne(newEvent)
            res.send(result)
        })

        app.get('/events', async (req, res) => {
            const email = req.query.email
            const query = {}
            if (email) {
                query.email = email
            }
            const cursor = eventsCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/events/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await eventsCollection.findOne(query)
            res.send(result)
        })

        app.delete('/events/:id', async(req,res)=>{
            const id = req.params.id
            const query = { _id: new ObjectId(id)}
            const result = await eventsCollection.deleteOne(query)
            res.send(result)
        })



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